import express from 'express';
import { getAllGoldenSeaters, getGoldenSeatersById } from '../controllers/golden-seats-controller.js';
const router = express.Router();



router.get('/golden-seats', getAllGoldenSeaters)
router.get('/goldenowner', getGoldenSeatersById)

export default router