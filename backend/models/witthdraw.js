import mongoose from "mongoose";

const WithdrawSchema = new mongoose.Schema({
   memberID: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 1
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ['GCash', 'PayMaya', 'Bank Transfer']
  },
  accountNumber: {
    type: String,
    required: true
  },
  accountName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Completed', 'Rejected'],
    default: 'Pending'
  },

} );

export const Withdraw = mongoose.model("Withdraw", WithdrawSchema);