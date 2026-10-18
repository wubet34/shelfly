const pool = require('../../config/database');
async function list(businessId) { return pool.query('SELECT id,name,email,role,permissions,active,created_at FROM users WHERE business_id=$1 ORDER BY name', [businessId]); }
async function create(businessId, userId, employee) {
  const result = await pool.query("INSERT INTO users(business_id,name,email,password_hash,role) VALUES($1,$2,lower($3),$4,'EMPLOYEE') RETURNING id,name,email,role,permissions,active,created_at", [businessId, employee.name, employee.email, employee.passwordHash]);
  await pool.query("INSERT INTO audit_log(business_id,user_id,action,entity,entity_id) VALUES($1,$2,'create','employee',$3)", [businessId, userId, result.rows[0].id]);
  return result;
}
async function setActive(id, businessId, active) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query("UPDATE users SET active=$3 WHERE id=$1 AND business_id=$2 AND role='EMPLOYEE' RETURNING id,name,email,role,permissions,active", [id, businessId, active]);
    if (result.rowCount && !active) await client.query('DELETE FROM sessions WHERE user_id=$1', [id]);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}
module.exports = { list, create, setActive };
