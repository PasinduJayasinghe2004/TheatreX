import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

async function testConnection() {
    console.log("--- DB Connection Debugger (30s Timeout) ---");
    const sanitizedUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
    console.log(`URL: ${sanitizedUrl}`);

    // Test 1: Strict SSL (as in database.js)
    console.log("\n1. Testing strict SSL config (ssl: true)...");
    const poolStrict = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
        connectionTimeoutMillis: 30000
    });

    try {
        const client = await poolStrict.connect();
        console.log("✅ Connection Successful with ssl:true!");
        client.release();
        await poolStrict.end();
        return;
    } catch (err) {
        console.error("❌ Failed with ssl:true:");
        console.error(`   Message: ${err.message}`);
        console.error(`   Code: ${err.code}`);
        if (err.code === '28P01') console.error("   Hint: Invalid Password or Username");
        if (err.code === '3D000') console.error("   Hint: Database does not exist");
        if (err.message.includes('self signed')) console.error("   Hint: SSL Self Signed Certificate");
        await poolStrict.end();
    }

    // Test 2: Relaxed SSL
    console.log("\n2. Testing relaxed SSL config (ssl: { rejectUnauthorized: false })...");
    const poolRelaxed = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 30000
    });

    try {
        const client = await poolRelaxed.connect();
        console.log("✅ Connection Successful with relaxed SSL!");
        client.release();
        await poolRelaxed.end();
    } catch (err) {
        console.error("❌ Failed with relaxed SSL:");
        console.error(`   Message: ${err.message}`);
        console.error(`   Code: ${err.code}`);
        await poolRelaxed.end();
    }
}

testConnection();
