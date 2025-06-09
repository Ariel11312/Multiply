import express from 'express';
import { getAllOrder, placeOrder, updateOrderStatus, updateOrderStatusHandler, userOrder } from '../controllers/order-controller.js';
const router = express.Router();

router.post('/place-order', placeOrder)
router.get('/user-order', userOrder)
router.get('/all-orders', getAllOrder);
router.put('/update-order/:_id',updateOrderStatusHandler);

export default router;