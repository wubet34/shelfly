const repository = require('./product.repository');
async function list(req, res, next) {
  try {
    const query = (req.query.q || '').toString().slice(0, 100);
    const result = await repository.list(req.user.business_id, req.user.role, query, req.query.low === 'true');
    res.json({ products: result.rows });
  } catch (error) { next(error); }
}
async function create(req, res, next) {
  try { res.status(201).json({ product: await repository.create(req.user.business_id, req.user.user_id, req.body) }); }
  catch (error) { if (error.code === '23505') return res.status(409).json({ error: 'A product with this SKU already exists.' }); next(error); }
}
async function update(req, res, next) {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) return res.status(400).json({ error: 'Invalid product id' });
  try {
    const result = await repository.update(id, req.user.business_id, req.body);
    if (!result.rowCount) return res.status(404).json({ error: 'Product not found' });
    res.json({ product: result.rows[0] });
  } catch (error) { if (error.code === '23505') return res.status(409).json({ error: 'A product with this SKU already exists.' }); next(error); }
}
module.exports = { list, create, update };
