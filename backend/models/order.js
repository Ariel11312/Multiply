import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: false
  },
  customerId: String,
  name: String,
  price: Number,
  quantity: Number,
  image: String
});

const orderSchema = new mongoose.Schema({
  customerId: { type:String, required: false },
  email: { type: String, required: false },
  name: { type: String, required: false },
  phone: { type: String, required: false },
  address: { type: String, required: false },
  region: { type: String, required: false },
  province: { type: String, required: false },
  city: { type: String, required: false },
  barangay: { type: String, required: false },
  postalCode: { type: String },
  landmark: { type: String },
  paymentMethod: { type: String, required: false },

  // Names for display
  region: { type: String },
  province: { type: String },
  city: { type: String },
  barangay: { type: String },

  // Cart items
  orderItems: [orderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped','out-for-delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  // Optional fields like createdAt/updatedAt
}, { timestamps: false });

export const Order = mongoose.model('Order', orderSchema);
