const bcrypt = require('bcrypt');
const repository = require('./employee.repository');
async function list(req, res, next) { try { const result = await repository.list(req.user.business_id); res.json({ employees: result.rows }); } catch (error) { next(error); } }
async function create(req, res, next) {
  try {
    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const result = await repository.create(req.user.business_id, req.user.user_id, { ...req.body, passwordHash });
    res.status(201).json({ employee: result.rows[0] });
  } catch (error) { if (error.code === '23505') return res.status(409).json({ error: 'That email is already in use.' }); next(error); }
}
async function setActive(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid employee id' });
  try {
    const result = await repository.setActive(id, req.user.business_id, req.body.active);
    if (!result.rowCount) return res.status(404).json({ error: 'Employee not found' });
    res.json({ employee: result.rows[0] });
  } catch (error) { next(error); }
}
module.exports = { list, create, setActive };
