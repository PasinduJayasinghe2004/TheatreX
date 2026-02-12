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
  ssl: true,             // Required for Neon Cloud PostgreSQL
  max: 10,               // Maximum number of connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 30000
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
