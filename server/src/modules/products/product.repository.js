const pool = require('../../config/database');
async function list(businessId, role, query, lowOnly) {
  return pool.query("SELECT id,name,sku,category,barcode,supplier,CASE WHEN $4::text='OWNER' THEN cost ELSE 0 END cost,price,stock,threshold,active,created_at,updated_at FROM products WHERE business_id=$1 AND active=true AND ($2='' OR name ILIKE '%'||$2||'%' OR sku ILIKE '%'||$2||'%') AND (NOT $3 OR stock<=threshold) ORDER BY name LIMIT 500", [businessId, query, lowOnly, role]);
}
async function create(businessId, userId, product) {
  const result = await pool.query('INSERT INTO products(business_id,name,sku,category,barcode,supplier,cost,price,stock,threshold) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *', [businessId, product.name, product.sku, product.category, product.barcode || null, product.supplier || null, product.cost, product.price, product.stock, product.threshold]);
  await pool.query('INSERT INTO audit_log(business_id,user_id,action,entity,entity_id) VALUES($1,$2,$3,$4,$5)', [businessId, userId, 'create', 'product', result.rows[0].id]);
  return result.rows[0];
}
async function update(id, businessId, product) {
  return pool.query('UPDATE products SET name=$3,sku=$4,category=$5,barcode=$6,supplier=$7,cost=$8,price=$9,stock=$10,threshold=$11,active=COALESCE($12,active),updated_at=now() WHERE id=$1 AND business_id=$2 RETURNING *', [id, businessId, product.name, product.sku, product.category, product.barcode || null, product.supplier || null, product.cost, product.price, product.stock, product.threshold, product.active ?? null]);
}
module.exports = { list, create, update };
