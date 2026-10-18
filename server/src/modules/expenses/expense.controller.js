const repository = require('./expense.repository');
async function list(req, res, next) { try { const result = await repository.list(req.user.business_id); res.json({ expenses: result.rows }); } catch (error) { next(error); } }
async function create(req, res, next) { try { const result = await repository.create(req.user.business_id, req.user.user_id, req.body); res.status(201).json({ expense: result.rows[0] }); } catch (error) { next(error); } }
module.exports = { list, create };
