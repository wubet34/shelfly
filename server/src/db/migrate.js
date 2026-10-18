require('dotenv').config();
const fs = require('node:fs');
const path = require('node:path');
const pool = require('../config/database');
async function migrate() {
  await pool.query('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT now())');
  const directory = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(directory).filter((name) => name.endsWith('.sql')).sort();
  for (const name of files) {
    const alreadyApplied = await pool.query('SELECT 1 FROM schema_migrations WHERE name=$1', [name]);
    if (alreadyApplied.rowCount) continue;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(fs.readFileSync(path.join(directory, name), 'utf8'));
      await client.query('INSERT INTO schema_migrations(name) VALUES($1)', [name]);
      await client.query('COMMIT');
      console.log('Applied migration ' + name);
    } catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
  }
}
migrate().catch((error) => { console.error(error.message); process.exitCode = 1; }).finally(() => pool.end());
