const pool = require('../../config/database');
const list = (businessId) => pool.query('SELECT id,description,amount,created_at FROM expenses WHERE business_id=$1 ORDER BY created_at DESC LIMIT 500', [businessId]);
const create = (businessId, userId, expense) => pool.query('INSERT INTO expenses(business_id,user_id,description,amount) VALUES($1,$2,$3,$4) RETURNING *', [businessId, userId, expense.description, expense.amount]);
module.exports = { list, create };
