// ============================================================================
// Notification Model Test
// ============================================================================
// Verifies CRUD methods of the Notification model
// Created by: M1 (Pasindu) - Day 16
// ============================================================================

import { Notification, createNotificationsTable } from '../models/notificationModel.js';
import { pool } from '../config/database.js';

async function testNotificationModel() {
    try {
        console.log('🚀 Starting Notification Model test...');

        // Ensure table exists
        await createNotificationsTable();

        // 1. Create a notification
        console.log('1. Testing Notification.create...');
        const testNotif = await Notification.create({
            user_id: 1, // Assumes user 1 exists or just tests the insertion logic
            type: 'reminder',
            title: 'Test Reminder',
            message: 'This is a test notification message'
        });
        console.log('✅ Created:', testNotif);

        // 2. Get unread count
        console.log('2. Testing Notification.getUnreadCount...');
        const unreadCount = await Notification.getUnreadCount(1);
        console.log('✅ Unread count for user 1:', unreadCount);

        // 3. Get all for user
        console.log('3. Testing Notification.getAllForUser...');
        const allNotifs = await Notification.getAllForUser(1);
        console.log('✅ Fetched', allNotifs.length, 'notifications');

        // 4. Mark as read
        console.log('4. Testing Notification.markAsRead...');
        const updatedNotif = await Notification.markAsRead(testNotif.id, 1);
        console.log('✅ Marked as read:', updatedNotif.is_read, updatedNotif.read_at);

        // 5. Mark all as read
        console.log('5. Testing Notification.markAllAsRead...');
        await Notification.markAllAsRead(1);
        const finalUnreadCount = await Notification.getUnreadCount(1);
        console.log('✅ Final unread count should be 0:', finalUnreadCount);

        console.log('🎉 Notification Model tests completed successfully!');
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await pool.end();
    }
}

testNotificationModel();
