import express from "express"
import { allUsers, memberReferral } from "../controllers/users-controller.js";

const router = express.Router();

// Get all items
router.get('/all-users', allUsers);
router.get('/user-details/:referralCode', memberReferral);

export default router