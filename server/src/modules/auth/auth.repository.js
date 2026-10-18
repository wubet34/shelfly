const pool = require('../../config/database');
async function findUserByEmail(email) {
  return pool.query('SELECT u.id,u.business_id,u.name,u.email,u.password_hash,u.role,u.permissions,b.name AS business_name FROM users u JOIN businesses b ON b.id=u.business_id WHERE u.email=lower($1) AND u.active=true', [email]);
}
async function createSession(id, userId, csrfToken) {
  return pool.query("INSERT INTO sessions(id,user_id,csrf_token,expires_at) VALUES($1,$2,$3,now()+interval '7 days')", [id, userId, csrfToken]);
}
async function deleteSession(id) { return pool.query('DELETE FROM sessions WHERE id=$1', [id]); }
async function findPasswordHash(userId) { return pool.query('SELECT password_hash FROM users WHERE id=$1 AND active=true', [userId]); }
async function changePassword(userId, sessionId, passwordHash) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE users SET password_hash=$2 WHERE id=$1', [userId, passwordHash]);
    await client.query('DELETE FROM sessions WHERE user_id=$1 AND id<>$2', [userId, sessionId]);
    await client.query('COMMIT');
  } catch (error) { await client.query('ROLLBACK').catch(() => {}); throw error; }
  finally { client.release(); }
}
module.exports = { findUserByEmail, createSession, deleteSession, findPasswordHash, changePassword };
