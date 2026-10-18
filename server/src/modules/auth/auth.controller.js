const service = require('./auth.service');
const { cookieName } = require('../../config/env');
const { setCookie, clearAuthCookies } = require('../../middleware/authenticate');

const MAX_LOGIN_ATTEMPTS = 8;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const SESSION_COOKIE_MAX_AGE = 7 * 24 * 60 * 60;
const loginAttempts = new Map();

function publicUser(user, authenticated = false) {
  return {
    id: authenticated ? user.user_id : user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    businessId: user.business_id,
    businessName: user.business_name,
  };
}

function recordFailedAttempt(ip, now) {
  const previous = loginAttempts.get(ip);
  if (previous && previous.until > now) {
    loginAttempts.set(ip, { count: previous.count + 1, until: previous.until });
    return;
  }

  loginAttempts.set(ip, { count: 1, until: now + LOGIN_WINDOW_MS });
}

async function login(req, res, next) {
  const now = Date.now();
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const attempt = loginAttempts.get(ip);

  if (attempt && attempt.until > now && attempt.count >= MAX_LOGIN_ATTEMPTS) {
    return res.status(429).json({ error: 'Too many login attempts. Try again later.' });
  }

  try {
    const result = await service.signIn(req.body.email, req.body.password);
    if (!result) {
      recordFailedAttempt(ip, now);
      return res.status(401).json({ error: 'Email or password is incorrect.' });
    }

    loginAttempts.delete(ip);
    setCookie(res, cookieName, result.sessionId, {
      httpOnly: true,
      maxAge: SESSION_COOKIE_MAX_AGE,
    });
    setCookie(res, 'distro_csrf', result.csrfToken, { maxAge: SESSION_COOKIE_MAX_AGE });

    return res.json({ user: publicUser(result.user), csrfToken: result.csrfToken });
  } catch (error) {
    return next(error);
  }
}

function session(req, res) {
  return res.json({ user: publicUser(req.user, true), csrfToken: req.csrf });
}

async function logout(req, res, next) {
  try {
    await service.deleteSession(req.sid);
  } catch (error) {
    clearAuthCookies(res);
    return next(error);
  }
  clearAuthCookies(res);
  return res.json({ ok: true });
}

async function changePassword(req, res, next) {
  try {
    const changed = await service.changePassword(req.user.user_id, req.sid, req.body.currentPassword, req.body.newPassword);
    if (!changed) return res.status(400).json({ error: 'Current password is incorrect.' });
    return res.json({ ok: true });
  } catch (error) { return next(error); }
}

module.exports = { login, session, logout, changePassword };
