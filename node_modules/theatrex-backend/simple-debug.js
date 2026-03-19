import net from 'net';
import dns from 'dns';

const HOST = 'ep-polished-hill-a1ophvun-pooler.ap-southeast-1.aws.neon.tech';
const PORT = 5432;

const testPort = (host, port, name) => {
    return new Promise((resolve) => {
        console.log(`Testing connection to ${name} (${host}:${port})...`);
        const socket = new net.Socket();
        socket.setTimeout(5000); // 5s timeout
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
    console.log(`\n--- Testing Connection ---`);

    // 1. Resolve DNS
    console.log(`\n--- DNS Lookup ---`);
    try {
        const addresses = await dns.promises.resolve(HOST);
        console.log(`✅ DNS Resolved ${HOST} to:`, addresses);
    } catch (e) {
        console.log(`❌ DNS Resolution failed for ${HOST}:`, e.message);
    }

    // 2. Test Neon PostgreSQL
    console.log(`\n--- Neon Connectivity ---`);
    await testPort(HOST, PORT, 'Neon Cloud PostgreSQL');

    // 3. Test Localhost
    console.log(`\n--- Localhost Connectivity ---`);
    await testPort('127.0.0.1', 5432, 'Localhost PostgreSQL');
};

run();
