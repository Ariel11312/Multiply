import express from 'express';
const router = express.Router();
import { addCart, decreaseQuantity, QuantityIncrease, deleteCart, userCart } from '../controllers/cart-controller.js';


router.post('/addcart', addCart)
router.get('/usercart', userCart)
router.delete('/items/:itemId', deleteCart);
router.put('/decrease/:itemId/:cartId', decreaseQuantity);
router.put('/increase/:itemId/:cartId', QuantityIncrease);
export default router