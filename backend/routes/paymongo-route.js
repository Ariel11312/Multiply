import express from 'express';
import { createPayment } from '../controllers/paymongo-controller.js';
import axios from 'axios';
const router = express.Router();

router.post('/create-payment', createPayment)
const XENDIT_SECRET_KEY = process.env.XENDIT_SECRET_KEY;
router.get('/status/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const response = await axios.get(`https://api.xendit.co/payment_requests/69e90178-c523-446b-83d0-59cdf683d1f6`, {
      auth: {
        username: XENDIT_SECRET_KEY,
        password: '', // Xendit requires empty password for basic auth
      },
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching Xendit payment request:', error?.response?.data || error.message);
    res.status(error?.response?.status || 500).json({
      message: 'Failed to fetch payment request status',
      error: error?.response?.data || error.message,
    });
  }
});
export default router;