import mongoose from "mongoose";

const proofSchema = new mongoose.Schema({
    // Basic Information
    id: {
        type: String,
        required: true,
        trim: true
    },
    image: {
        type: String,
        required: true,
        trim: true
    },
    // Phone Authentication Fields
    date: {
        type: String,
        trim: true,  // Allows null/undefined while still maintaining uniqueness
    },

})
export const Proof = mongoose.model("Proof", proofSchema);