import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    category: {
        type: String,
        required: true
    },
    inStock: {
        type: Boolean,
        default: true
    },
    memberId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    images: {
        type: [String],
        required: true,
        validate: {
            validator: function(v) {
                return v.length > 0; // At least one image is required
            },
            message: 'At least one image URL must be provided'
        }
    }
});

export const Item = mongoose.model('Item', itemSchema);