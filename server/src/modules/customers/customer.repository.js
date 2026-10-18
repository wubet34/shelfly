const pool = require('../../config/database');
const lookup = (businessId) => pool.query('SELECT id,name,phone FROM customers WHERE business_id=$1 ORDER BY name LIMIT 500', [businessId]);
const list = (businessId) => pool.query('SELECT c.id,c.name,c.phone,c.balance,c.created_at,count(DISTINCT s.id)::int visits FROM customers c LEFT JOIN sales s ON s.customer_id=c.id WHERE c.business_id=$1 GROUP BY c.id ORDER BY c.name', [businessId]);
const create = (businessId, customer) => pool.query('INSERT INTO customers(business_id,name,phone) VALUES($1,$2,$3) RETURNING *', [businessId, customer.name, customer.phone]);
const update = (id, businessId, customer) => pool.query('UPDATE customers SET name=$3,phone=$4 WHERE id=$1 AND business_id=$2 RETURNING *', [id, businessId, customer.name, customer.phone]);
const findById = (id, businessId) => pool.query('SELECT id,balance FROM customers WHERE id=$1 AND business_id=$2', [id, businessId]);
const remove = (id, businessId) => pool.query('DELETE FROM customers c WHERE c.id=$1 AND c.business_id=$2 AND c.balance=0 AND NOT EXISTS(SELECT 1 FROM sales s WHERE s.customer_id=c.id) RETURNING c.id', [id, businessId]);
module.exports = { lookup, list, create, update, findById, remove };
