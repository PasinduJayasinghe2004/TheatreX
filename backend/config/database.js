import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend root (one level up from config)
dotenv.config({ path: path.join(__dirname, '../.env') });

// Create PostgreSQL connection pool using Neon connection string
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'false' ? false : true,
  max: Number(process.env.DB_POOL_MAX || 20),
  min: Number(process.env.DB_POOL_MIN || 2),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 30000),
  connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS || 30000),
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000
});

// Test database connection
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully!');
    console.log(`📊 Connected to PostgreSQL (Neon Cloud)`);
    client.release();
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

export { pool, testConnection };
