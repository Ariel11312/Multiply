import mongoose from "mongoose";
const cartSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    items: [{
      itemId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Item',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      quantity: { 
        type: Number, 
        required: true,
        min: 1
      },
      price: { 
        type: Number, 
        required: true 
      },
      imageUrl: {
        type: String
      }
    }],
    totalAmount: {
      type: Number,
      default: 0
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  });
  
  // Pre-save hook to calculate total amount
  cartSchema.pre('save', function(next) {
    this.totalAmount = this.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
    
    this.updatedAt = Date.now();
    next();
  });
  
 export const Cart = mongoose.model('Cart', cartSchema);