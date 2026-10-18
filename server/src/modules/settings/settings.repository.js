const pool = require('../../config/database');
const get = (businessId) => pool.query('SELECT name,currency,timezone FROM businesses WHERE id=$1', [businessId]);
const update = (businessId, settings) => pool.query('UPDATE businesses SET name=$2,currency=$3,timezone=$4 WHERE id=$1 RETURNING name,currency,timezone', [businessId, settings.name, settings.currency, settings.timezone]);
module.exports = { get, update };
