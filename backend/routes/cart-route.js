import express from 'express';
const router = express.Router();
import { addCart, userCart } from '../controllers/cart-controller.js';


router.post('/addcart', addCart)
router.get('/usercart', userCart)

export default router