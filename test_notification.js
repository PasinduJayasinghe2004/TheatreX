import { createNotification } from './backend/controllers/notificationController.js';
import { Notification } from './backend/models/notificationModel.js';

// Mock Express response object
const mockRes = {
    status: function (code) {
        this.statusCode = code;
        return this;
    },
    json: function (data) {
        this.data = data;
        return this;
    }
};

async function runTest() {
    console.log('Testing createNotification controller...');

    // Mock Request object
    const mockReq = {
        body: {
            user_id: 1, // Assumes user with ID 1 exists
            type: 'info',
            title: 'Verification Test',
            message: 'This is a test notification created during verification.'
        }
    };

    try {
        await createNotification(mockReq, mockRes);
        console.log('Response Status:', mockRes.statusCode);
        console.log('Response Data:', JSON.stringify(mockRes.data, null, 2));

        if (mockRes.statusCode === 201) {
            console.log('✅ Test Passed: Notification created successfully.');
        } else {
            console.log('❌ Test Failed: Status code ' + mockRes.statusCode);
        }
    } catch (error) {
        console.error('❌ Test Errored:', error);
    }

    process.exit();
}

runTest();
