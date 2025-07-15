// server.js - Node.js Backend
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HitPay API Configuration
const HITPAY_API_URL = 'https://api.sandbox.hit-pay.com/v1/payment-requests';
const HITPAY_API_KEY = process.env.HITPAY_API_KEY; // Store in .env file

// Create Payment Request Endpoint
app.post('/api/create-payment', async (req, res) => {
  try {
    const {
      amount,
      currency = 'SGD',
      email,
      name,
      purpose,
      reference_number,
      redirect_url,
      webhook,
      payment_methods = ['paynow_online', 'card', 'wechat', 'alipay'],
      allow_repeated_payments = false,
      expiry_date
    } = req.body;

    // Validate required fields
    if (!amount || !currency) {
      return res.status(400).json({
        error: 'Amount and currency are required fields'
      });
    }

    // Prepare form data
    const formData = new URLSearchParams();
    formData.append('amount', amount);
    formData.append('currency', currency);
    
    if (email) formData.append('email', email);
    if (name) formData.append('name', name);
    if (purpose) formData.append('purpose', purpose);
    if (reference_number) formData.append('reference_number', reference_number);
    if (redirect_url) formData.append('redirect_url', redirect_url);
    if (webhook) formData.append('webhook', webhook);
    if (allow_repeated_payments) formData.append('allow_repeated_payments', allow_repeated_payments);
    if (expiry_date) formData.append('expiry_date', expiry_date);

    // Add payment methods
    payment_methods.forEach(method => {
      formData.append('payment_methods[]', method);
    });

    // Make request to HitPay API
    const response = await axios.post(HITPAY_API_URL, formData, {
      headers: {
        'X-BUSINESS-API-KEY': HITPAY_API_KEY,
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });

    // Return payment request data
    res.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Payment creation error:', error.response?.data || error.message);
    
    res.status(error.response?.status || 500).json({
      success: false,
      error: error.response?.data || 'Failed to create payment request',
      message: error.message
    });
  }
});

// Payment Success Callback (optional)
app.get('/api/payment-callback', (req, res) => {
  const { reference, status } = req.query;
  
  // Handle payment callback
  console.log('Payment callback received:', { reference, status });
  
  // Redirect to frontend success page
  res.redirect(`${process.env.FRONTEND_URL}/payment-success?reference=${reference}&status=${status}`);
});

// Webhook handler (optional)
app.post('/api/webhook', (req, res) => {
  // Handle webhook from HitPay
  console.log('Webhook received:', req.body);
  
  // Process webhook data
  // Update your database, send emails, etc.
  
  res.status(200).send('OK');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// package.json dependencies needed:
/*
{
  "name": "hitpay-payment-backend",
  "version": "1.0.0",
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.4.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1"
  }
}
*/