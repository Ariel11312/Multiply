import { Notification } from '../models/notification.js';
// Example: Get all notifications
export const getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find();
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Example: Create a new notification
export const createNotification = async (req, res) => {
    const notification = new Notification(req.body);
    try {
        const savedNotification = await notification.save();
        res.status(201).json(savedNotification);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};