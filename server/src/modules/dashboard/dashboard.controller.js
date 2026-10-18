const repository = require('./dashboard.repository');
async function getSummary(req, res, next) {
  try {
    const [today, inventory, recent, trend, top] = await repository.getSummary(req.user);
    res.json({ today: today.rows[0], inventory: inventory.rows[0], recentSales: recent.rows, revenueTrend: trend.rows, topProducts: top.rows });
  } catch (error) { next(error); }
}
module.exports = { getSummary };
