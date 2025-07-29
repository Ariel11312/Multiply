import express from 'express';
import { approvWithdraw, createMember, createPackage, createPayment, getAllUserProof, getMemberById, getPaymentById, getProofById, getReapers, memberReferral, updateMember, upgradePackage } from '../controllers/member-controller.js';
import { getReferralTree, referrals } from '../controllers/referrals.js';
import { createWithdrawal } from '../controllers/withdraw-controller.js';
const router = express.Router();

router.post('/create-member', createMember)
router.put('/update-member', updateMember)
router.get('/view-referrals', referrals)
router.get('/check-member/:id', getMemberById)
router.get('/check-payment/:id', getPaymentById)
router.get('/check-proof/:id', getProofById)
router.get('/referral-tree', getReferralTree); // Gets complete tree up to 7 levels
router.get('/memberReferral/:referralCode', memberReferral);
router.post('/upgrade', upgradePackage);
router.post('/create-package', createPackage);
router.post('/reapers', getReapers);
router.get('/get-all-user-proof', getAllUserProof);
router.post('/createpayment', createPayment);
router.post('/createwithdraw', createWithdrawal);
router.post('/approvewithdraw', approvWithdraw);

export default router;