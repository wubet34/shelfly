const pool = require('../../config/database');
async function getSummary(user) {
  return Promise.all([
    pool.query("SELECT COALESCE((SELECT sum(total) FROM sales WHERE business_id=$1 AND created_at >= date_trunc('day',now() AT TIME ZONE $2) AT TIME ZONE $2),0) revenue,(SELECT count(*)::int FROM sales WHERE business_id=$1 AND created_at >= date_trunc('day',now() AT TIME ZONE $2) AT TIME ZONE $2) transactions,COALESCE((SELECT sum(si.quantity*(si.unit_price-si.unit_cost)) FROM sale_items si JOIN sales s ON s.id=si.sale_id WHERE s.business_id=$1 AND s.created_at >= date_trunc('day',now() AT TIME ZONE $2) AT TIME ZONE $2),0) gross_profit", [user.business_id, user.timezone]),
    pool.query('SELECT count(*)::int total,count(*) FILTER(WHERE stock<=threshold)::int low_stock FROM products WHERE business_id=$1 AND active=true', [user.business_id]),
    pool.query('SELECT s.id,s.total,s.payment_method,s.created_at,u.name employee,c.name customer FROM sales s JOIN users u ON u.id=s.employee_id LEFT JOIN customers c ON c.id=s.customer_id WHERE s.business_id=$1 ORDER BY s.created_at DESC LIMIT 8', [user.business_id]),
    pool.query("SELECT (s.created_at AT TIME ZONE $2)::date AS \"day\",COALESCE(sum(s.total),0) revenue FROM sales s WHERE s.business_id=$1 AND s.created_at>=now()-interval '30 days' GROUP BY \"day\" ORDER BY \"day\"", [user.business_id, user.timezone]),
    pool.query("SELECT p.id,p.name,p.sku,sum(si.quantity)::int quantity,sum(si.quantity*si.unit_price) revenue FROM sale_items si JOIN sales s ON s.id=si.sale_id JOIN products p ON p.id=si.product_id WHERE s.business_id=$1 AND s.created_at>=now()-interval '30 days' GROUP BY p.id ORDER BY quantity DESC LIMIT 5", [user.business_id]),
  ]);
}
module.exports = { getSummary };
