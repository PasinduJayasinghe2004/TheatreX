import net from 'net';
import dns from 'dns';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

// Parse the DATABASE_URL to extract host and port
const dbUrl = new URL(process.env.DATABASE_URL);
const DB_HOST = dbUrl.hostname;
const DB_PORT = parseInt(dbUrl.port) || 5432;

const testPort = (host, port, name) => {
    return new Promise((resolve) => {
        console.log(`Testing connection to ${name} (${host}:${port})...`);
        const socket = new net.Socket();
        socket.setTimeout(3000);
        socket.on('connect', () => {
            console.log(`✅ Success: Connected to ${name}`);
            socket.destroy();
            resolve(true);
        });
        socket.on('timeout', () => {
            console.log(`❌ Timeout: Could not connect to ${name} (Firewall/IP Block?)`);
            socket.destroy();
            resolve(false);
        });
        socket.on('error', (err) => {
            console.log(`❌ Error: Could not connect to ${name} - ${err.message}`);
            resolve(false);
        });
        socket.connect(port, host);
    });
};

const run = async () => {
    console.log(`\n--- DB Config Verification ---`);
    console.log(`Host: ${DB_HOST}`);
    console.log(`Port: ${DB_PORT}`);

    // 1. Resolve DNS
    console.log(`\n--- DNS Lookup ---`);
    try {
        const addresses = await dns.promises.resolve(DB_HOST);
        console.log(`✅ DNS Resolved ${DB_HOST} to:`, addresses);
    } catch (e) {
        console.log(`❌ DNS Resolution failed for ${DB_HOST}:`, e.message);
    }

    // 2. Test Neon PostgreSQL
    console.log(`\n--- Connectivity Check ---`);
    await testPort(DB_HOST, DB_PORT, 'Neon Cloud PostgreSQL');

    // 3. Test Localhost PostgreSQL
    await testPort('127.0.0.1', 5432, 'Localhost PostgreSQL');
};

run();
