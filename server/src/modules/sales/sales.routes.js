const express = require('express');
const router = express.Router();
const pool = require('../../config/database');
const { schemas, validated } = require('../../middleware/validation');
const { createSale } = require('./sale.service');
const repository = require('./sale.repository');

router.get('/sales', async (req, res, next) => {
  try {
    const result = await repository.listSales(pool, req.user);
    res.json({ sales: result.rows });
  } catch (error) { next(error); }
});

router.post('/sales', validated(schemas.sale), async (req, res, next) => {
  const key = req.get('Idempotency-Key');
  if (!key || !/^[a-zA-Z0-9._:-]{16,128}$/.test(key)) return res.status(400).json({ error: 'A valid Idempotency-Key header is required.' });
  try {
    const result = await createSale(req.user, req.body, key);
    res.status(result.replayed ? 200 : 201).json({ sale: result.sale });
  } catch (error) {
    if (error.status) return res.status(error.status).json({ error: error.message });
    next(error);
  }
});
module.exports = router;
