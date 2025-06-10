import express from 'express';
import { getAllNotifications, markAsRead } from '../controllers/notification-controller.js'; // Import your notification controller if needed
const router = express.Router();

router.get('/all-notif', getAllNotifications);
router.put('/mark-read/:notificationId', markAsRead);

// Example: POST a new notification
router.post('/', async (req, res) => {
    // Replace with your logic to create a notification
    res.json({ message: 'Notification created' });
});

export default router;