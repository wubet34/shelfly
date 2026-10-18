const pool = require('../../config/database');
const { audit } = require('../../utils/audit');
const repository = require('./sale.repository');
const { prepareSale, fromCents } = require('./money');

async function createSale(user, input, idempotencyKey, dependencies = {}) {
  const database = dependencies.pool || pool;
  const salesRepository = dependencies.repository || repository;
  const existing = await salesRepository.findByIdempotency(database, user.business_id, idempotencyKey);
  if (existing.rowCount) return { sale: existing.rows[0], replayed: true };
  const client = await database.connect();
  try {
    await client.query('BEGIN');
    const replay = await client.query('SELECT * FROM sales WHERE business_id=$1 AND idempotency_key=$2 FOR UPDATE', [user.business_id, idempotencyKey]);
    if (replay.rowCount) { await client.query('COMMIT'); return { sale: replay.rows[0], replayed: true }; }
    if (input.paymentMethod === 'CREDIT' && !input.customerId) throw Object.assign(new Error('Credit sales require a customer.'), { status: 400 });
    if (input.customerId) {
      const customer = await client.query('SELECT id FROM customers WHERE id=$1 AND business_id=$2', [input.customerId, user.business_id]);
      if (!customer.rowCount) throw Object.assign(new Error('Customer not found'), { status: 404 });
    }
    const productIds = [...new Set(input.items.map(({ productId }) => productId))].sort((a, b) => a - b);
    const products = await salesRepository.lockProducts(client, user.business_id, productIds);
    const { lines, total } = prepareSale(input.items, products);
    const sale = await client.query('INSERT INTO sales(business_id,employee_id,customer_id,payment_method,total,idempotency_key) VALUES($1,$2,$3,$4,$5,$6) RETURNING *', [user.business_id, user.user_id, input.customerId || null, input.paymentMethod, total, idempotencyKey]);
    let creditCents = 0n;
    for (const line of lines) {
      const product = line.product;
      await client.query('INSERT INTO sale_items(sale_id,product_id,quantity,unit_price,unit_cost) VALUES($1,$2,$3,$4,$5)', [sale.rows[0].id, product.id, line.quantity, product.price, product.cost]);
      const stockUpdate = await client.query('UPDATE products SET stock=stock-$2,updated_at=now() WHERE id=$1 AND business_id=$3 AND stock >= $2', [product.id, line.quantity, user.business_id]);
      if (!stockUpdate.rowCount) throw Object.assign(new Error(`Insufficient stock for ${product.name}. Only ${product.stock} in stock.`), { status: 409 });
      await client.query("INSERT INTO inventory_movements(business_id,product_id,sale_id,user_id,movement_type,quantity_delta) VALUES($1,$2,$3,$4,'SALE',$5)", [user.business_id, product.id, sale.rows[0].id, user.user_id, -line.quantity]);
      creditCents += line.lineTotalCents;
    }
    if (input.paymentMethod === 'CREDIT') await client.query('UPDATE customers SET balance=balance+$2 WHERE id=$1 AND business_id=$3', [input.customerId, fromCents(creditCents), user.business_id]);
    await audit(client, user, 'create', 'sale', sale.rows[0].id, { total, lineCount: lines.length });
    await client.query('COMMIT');
    return { sale: sale.rows[0], replayed: false };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    if (error.code === '23505') {
      const duplicate = await salesRepository.findByIdempotency(database, user.business_id, idempotencyKey);
      if (duplicate.rowCount) return { sale: duplicate.rows[0], replayed: true };
    }
    throw error;
  } finally { client.release(); }
}
module.exports = { createSale };
