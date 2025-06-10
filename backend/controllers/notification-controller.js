import { Notification } from '../models/notification.js';
import jwt from "jsonwebtoken";

// Example: Get all notifications
export const getAllNotifications = async (req, res) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }
        // Verify JWT token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }
   const notifications = await Notification.find({ 
  userId: decoded.userId
}); 
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
export const markAsRead = async (req, res) => {
    try {
    const { notificationId } = req.params;

    const updatedNotification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );
    res.status(200).json(updatedNotification);
  } catch (error) {
    res.status(500).json({ message: 'Error marking notification as read' });
  }
};
