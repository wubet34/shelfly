const production = process.env.NODE_ENV === 'production';
const cookieName = production ? '__Host-distro_sid' : 'distro_sid';
const origins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map((origin) => origin.trim());
module.exports = { production, cookieName, origins };
