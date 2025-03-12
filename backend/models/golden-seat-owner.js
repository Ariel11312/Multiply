import mongoose from "mongoose";
const ownerSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    position: {
        type:String,
        required:true
    },
    spot: {
        type:String,
        required:true
    }
}) 
    export const GoldenSeatOwner = mongoose.model('GoldenSeatOwner', ownerSchema);
