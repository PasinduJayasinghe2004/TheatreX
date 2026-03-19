import { Notification, createNotificationsTable } from '../models/notificationModel.js';
import { pool } from '../config/database.js';

describe('Notification Model', () => {
    beforeAll(async () => {
        // Ensure table exists
        await createNotificationsTable();
    });

    afterAll(async () => {
        await pool.end();
    });

    test('should create, fetch, and mark notifications as read', async () => {
        // 1. Create a notification
        const testNotif = await Notification.create({
            user_id: 1,
            type: 'reminder',
            title: 'Test Reminder',
            message: 'This is a test notification message'
        });
        expect(testNotif).toBeDefined();
        expect(testNotif.title).toBe('Test Reminder');

        // 2. Get unread count
        const unreadCount = await Notification.getUnreadCount(1);
        expect(Number(unreadCount)).toBeGreaterThanOrEqual(1);

        // 3. Get all for user
        const allNotifs = await Notification.getAllForUser(1);
        expect(allNotifs.length).toBeGreaterThanOrEqual(1);

        // 4. Mark as read
        const updatedNotif = await Notification.markAsRead(testNotif.id, 1);
        expect(updatedNotif.is_read).toBe(true);

        // 5. Mark all as read
        await Notification.markAllAsRead(1);
        const finalUnreadCount = await Notification.getUnreadCount(1);
        expect(Number(finalUnreadCount)).toBe(0);
    });
});
