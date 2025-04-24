import express from 'express';
import { placeOrder, userOrder } from '../controllers/order-controller.js';
const router = express.Router();

router.post('/place-order', placeOrder)
router.get('/user-order', userOrder)

export default router;