import { Order } from "../models/order.js";
import jwt from "jsonwebtoken";

/**
 * Controller to handle placing a new order
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */


export const userOrder = async (req, res) => {
  try {
      const token = req.cookies.token;
      if (!token) {
          return res.status(401).json({
              success: false,
              message: 'Authentication token is missing.',
          });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const { userId } = decoded;

      const userOrders = await Order.find({ customerId: userId });

      return res.status(200).json(userOrders);
      
  } catch (error) {
      console.error('Get order error:', error);
      return res.status(500).json({ 
          message: 'Failed to retrieve order',
          error: error.message 
      });
  }
};


export const placeOrder = async (req, res) => {
  try {
    const {
      customerId,
      email,
      name,
      phone,
      address,
      region,
      province,
      city,
      barangay,
      postalCode,
      landmark,
      paymentMethod,
      regionName,
      provinceName,
      cityName,
      barangayName,
      orderItems
    } = req.body;
console.log('Received order data:', req.body);
    // Validate required fields
    // if (!customerId || !email || !name || !phone || !address || !orderItems || orderItems.length === 0) {
    //   return res.status(400).json({ message: 'Missing required fields' });
    // }

    // Validate email format
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (!emailRegex.test(email)) {
    //   return res.status(400).json({ message: 'Invalid email format' });
    // }

    // Calculate order totals
    const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingFee = 150; // Example fixed shipping fee
    const total = subtotal + shippingFee;

    // Create a new order instance
    const newOrder = new Order({
      customerId,
      email,
      name,
      phone,
      address,
      region,
      province,
      city,
      barangay,
      postalCode,
      landmark,
      paymentMethod,
      regionName,
      provinceName,
      cityName,
      barangayName,
      orderItems,
      subtotal,
      shippingFee,
      total,
      status: 'pending',
      orderDate: new Date()
    });

    // Save to database
    const savedOrder = await newOrder.save();

    res.status(201).json({ 
      message: 'Order placed successfully', 
      order: savedOrder 
    });
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ 
      message: 'Something went wrong', 
      error: process.env.NODE_ENV === 'production' ? 'Server error' : error.message 
    });
  }
};

// Using ES modules export as the import style suggests this is preferred
export default { placeOrder };