const repository = require('./settings.repository');
async function get(req, res, next) { try { const result = await repository.get(req.user.business_id); res.json({ settings: result.rows[0] }); } catch (error) { next(error); } }
async function update(req, res, next) { try { const result = await repository.update(req.user.business_id, req.body); res.json({ settings: result.rows[0] }); } catch (error) { next(error); } }
module.exports = { get, update };
