import express from 'express';
import { getAllGoldenOwner, getAllGoldenSeaters, getGoldenSeatersById } from '../controllers/golden-seats-controller.js';
const router = express.Router();



router.get('/golden-seats', getAllGoldenSeaters)
router.get('/golden-seat-owner', getAllGoldenOwner)
router.get('/goldenowner', getGoldenSeatersById)

export default router