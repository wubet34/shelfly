require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('../../config/database');

async function seed() {
  if (process.env.NODE_ENV === 'production') throw new Error('Development seed is disabled in production.');
  if (!process.env.DATABASE_URL || !process.env.SEED_OWNER_EMAIL || !process.env.SEED_OWNER_PASSWORD || !process.env.SEED_OWNER_NAME) {
    throw new Error('Set DATABASE_URL, SEED_OWNER_EMAIL, SEED_OWNER_PASSWORD, and SEED_OWNER_NAME.');
  }
  if (process.env.SEED_OWNER_PASSWORD.length < 12) throw new Error('SEED_OWNER_PASSWORD must be at least 12 characters.');
  try {
    const passwordHash = await bcrypt.hash(process.env.SEED_OWNER_PASSWORD, 12);
    await pool.query('BEGIN');
    const business = await pool.query("INSERT INTO businesses(name) VALUES ($1) RETURNING id", [process.env.SEED_BUSINESS_NAME || 'Dessie Electronics']);
    await pool.query("INSERT INTO users(business_id,name,email,password_hash,role) VALUES ($1,$2,lower($3),$4,'OWNER')", [business.rows[0].id, process.env.SEED_OWNER_NAME, process.env.SEED_OWNER_EMAIL, passwordHash]);
    await pool.query('COMMIT');
    console.log('Owner account created.');
  } catch (error) { await pool.query('ROLLBACK'); throw error; }
  finally { await pool.end(); }
}
seed().catch((error) => { console.error(error.message); process.exitCode = 1; });
