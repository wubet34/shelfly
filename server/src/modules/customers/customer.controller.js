const repository = require('./customer.repository');
async function lookup(req, res, next) { try { const result = await repository.lookup(req.user.business_id); res.json({ customers: result.rows }); } catch (error) { next(error); } }
async function list(req, res, next) { try { const result = await repository.list(req.user.business_id); res.json({ customers: result.rows }); } catch (error) { next(error); } }
async function create(req, res, next) {
  try { const result = await repository.create(req.user.business_id, req.body); res.status(201).json({ customer: result.rows[0] }); }
  catch (error) { if (error.code === '23505') return res.status(409).json({ error: 'A customer with this phone already exists.' }); next(error); }
}
async function update(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid customer id' });
  try {
    const result = await repository.update(id, req.user.business_id, req.body);
    if (!result.rowCount) return res.status(404).json({ error: 'Customer not found' });
    return res.json({ customer: result.rows[0] });
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'A customer with this phone already exists.' });
    return next(error);
  }
}
async function remove(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid customer id' });
  try {
    const result = await repository.remove(id, req.user.business_id);
    if (result.rowCount) return res.json({ ok: true });
    const existing = await repository.findById(id, req.user.business_id);
    if (!existing.rowCount) return res.status(404).json({ error: 'Customer not found' });
    return res.status(409).json({ error: 'Customers with sales or an outstanding balance cannot be deleted.' });
  } catch (error) {
    if (error.code === '23503') return res.status(409).json({ error: 'This customer is linked to sales and cannot be deleted.' });
    return next(error);
  }
}
module.exports = { lookup, list, create, update, remove };
