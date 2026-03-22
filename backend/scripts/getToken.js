import fs from 'fs';

const email = 'testuser123@example.com';
const password = 'SecurePass123';

async function getToken() {
    try {
        const res = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!res.ok) {
            throw new Error('Login failed: ' + (await res.text()));
        }

        const data = await res.json();
        fs.writeFileSync('tokenOutput.txt', data.token);
    } catch (err) {
        console.error(err.message);
    }
}

getToken();
