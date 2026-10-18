const test = require('node:test');
const assert = require('node:assert/strict');
const { toCents, fromCents, prepareSale } = require('../modules/sales/money');
const { createSale } = require('../modules/sales/sale.service');

const products = [
  { id: 1, name: 'Cable', price: '0.10', cost: '0.03', stock: 5 },
  { id: 2, name: 'Adapter', price: '12.35', cost: '8.00', stock: 3 },
];

test('money conversion uses integer cents', () => {
  assert.equal(toCents('12.35'), 1235n);
  assert.equal(fromCents(1235n), '12.35');
  assert.equal(toCents('0.1'), 10n);
});

test('sale preparation combines repeated product lines and uses authoritative prices', () => {
  const sale = prepareSale([{ productId: 1, quantity: 2 }, { productId: 1, quantity: 1 }, { productId: 2, quantity: 1 }], products);
  assert.equal(sale.lines.length, 2);
  assert.equal(sale.lines[0].quantity, 3);
  assert.equal(sale.total, '12.65');
});

test('sale preparation rejects missing products and insufficient stock', () => {
  assert.throws(() => prepareSale([{ productId: 3, quantity: 1 }], products), { status: 404 });
  assert.throws(() => prepareSale([{ productId: 1, quantity: 6 }], products), { status: 409 });
});

test('money parsing rejects values beyond the database scale', () => {
  assert.throws(() => toCents('1.001'), /two decimal places/);
});

test('replaying an idempotency key returns the existing sale without opening a transaction', async () => {
  const original = { id: 24, total: '10.00' };
  const database = { connect() { assert.fail('A replay must not open a transaction.'); } };
  const repository = { async findByIdempotency() { return { rowCount: 1, rows: [original] }; } };
  const result = await createSale({ business_id: 1 }, { items: [] }, 'checkout-key-123456', { pool: database, repository });
  assert.equal(result.replayed, true);
  assert.deepEqual(result.sale, original);
});
