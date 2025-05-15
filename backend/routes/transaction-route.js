import express from "express";
import { GetAllTransaction, UpdateTransaction } from "../controllers/transaction-controller.js";
const router = express.Router();

router.get("/transaction", GetAllTransaction);
// In your routes file
router.put('/transaction/claim', UpdateTransaction);

export default router;
