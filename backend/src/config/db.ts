import { Pool } from 'pg';

const isLocal = process.env.DATABASE_URL?.includes('localhost') || process.env.DATABASE_URL?.includes('127.0.0.1');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } }),
});

pool.on('error', (err) => {
  console.error('Unexpected DB error', err);
  process.exit(-1);
});

export default pool;
