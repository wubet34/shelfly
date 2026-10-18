async function findByIdempotency(pool, businessId, key) {
  return pool.query('SELECT * FROM sales WHERE business_id=$1 AND idempotency_key=$2', [businessId, key]);
}
async function lockProducts(client, businessId, productIds) {
  const result = await client.query('SELECT id,name,price,cost,stock FROM products WHERE business_id=$1 AND active=true AND id=ANY($2::bigint[]) ORDER BY id FOR UPDATE', [businessId, productIds]);
  return result.rows;
}
async function listSales(pool, user) {
  return pool.query("SELECT s.id,s.total,s.payment_method,s.created_at,c.name customer,u.name employee,COALESCE(sum(si.quantity),0)::int item_count FROM sales s LEFT JOIN customers c ON c.id=s.customer_id JOIN users u ON u.id=s.employee_id LEFT JOIN sale_items si ON si.sale_id=s.id WHERE s.business_id=$1 AND ($2::text='OWNER' OR s.employee_id=$3) GROUP BY s.id,c.name,u.name ORDER BY s.created_at DESC LIMIT 500", [user.business_id, user.role, user.user_id]);
}
module.exports = { findByIdempotency, lockProducts, listSales };
