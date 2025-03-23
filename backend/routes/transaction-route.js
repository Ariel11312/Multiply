import express from "express"
import { GetAllTransaction, GoldenSeatsCommissions, UpdateTransaction } from "../controllers/transaction-controller.js"
const router = express.Router()


router.get("/transaction", GetAllTransaction)
router.get("/commisions",GoldenSeatsCommissions)
router.put("/transaction/:transactionId", UpdateTransaction)



export default router;