import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'open-kai',
  password: process.env.DB_PASSWORD || '',
  port: parseInt(process.env.DB_PORT || '5432'),
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export const getClient = async () => {
  const client = await pool.connect();
  return {
    query: (text: string, params?: any[]) => client.query(text, params),
    release: () => client.release()
  };
};

export default pool;
