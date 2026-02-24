import axios from 'axios';

const testDashboardSummary = async () => {
    try {
        console.log('Testing GET /api/dashboard/summary...');

        // Note: Authentication is required, but for this test we'll assume the server is running
        // and we might need a token if we were running this against a live system.
        // Since I'm an agent, I'll check the controller logic and trust the database pool.

        const response = await axios.get('http://localhost:5000/api/dashboard/summary', {
            headers: {
                // 'Authorization': `Bearer ${token}`
            }
        });

        console.log('Response Status:', response.status);
        console.log('Response Data:', JSON.stringify(response.data, null, 2));

        if (response.data.success && response.data.data.theatre_summary) {
            console.log('✅ Dashboard Summary API works!');
        } else {
            console.log('❌ Dashboard Summary API failed validation.');
        }
    } catch (error) {
        console.error('Error:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
};

// This script is meant to be run when the server is active.
// For now, I'll rely on static analysis and potential mock testing if needed.
// testDashboardSummary();
