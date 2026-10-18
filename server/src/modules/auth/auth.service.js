const crypto = require('node:crypto');
const bcrypt = require('bcrypt');
const repository = require('./auth.repository');
async function signIn(email, password) {
  const result = await repository.findUserByEmail(email);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) return null;
  const sessionId = crypto.randomBytes(32).toString('hex');
  const csrfToken = crypto.randomBytes(32).toString('hex');
  await repository.createSession(sessionId, user.id, csrfToken);
  return { sessionId, csrfToken, user };
}
async function changePassword(userId, sessionId, currentPassword, newPassword) {
  const result = await repository.findPasswordHash(userId);
  const user = result.rows[0];
  if (!user || !(await bcrypt.compare(currentPassword, user.password_hash))) return false;
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await repository.changePassword(userId, sessionId, passwordHash);
  return true;
}
module.exports = { signIn, changePassword, deleteSession: repository.deleteSession };
