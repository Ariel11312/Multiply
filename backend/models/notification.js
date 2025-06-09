import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    index: false
  },
  type: {
    type: String,
    required: true,
    enum: ['success', 'error', 'warning', 'info', 'order', 'promotion', 'system'],
    default: 'info'
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  isRead: {
    type: Boolean,
    default: false
  },
  metadata: {
    // For storing additional data like order IDs, product IDs, etc.
    type: mongoose.Schema.Types.Mixed
  },
  actionUrl: {
    // URL to redirect when notification is clicked
    type: String,
    trim: true
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 2 // 0 = low, 1 = medium, 2 = high
  },
  expiresAt: {
    type: Date,
    index: { expires: '7d' } // Auto-delete after 7 days by default
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1 });

// Pre-save hook to set default expiration
notificationSchema.pre('save', function(next) {
  if (!this.expiresAt) {
    // Default to 7 days from creation if not set
    this.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  next();
});


export const Notification = mongoose.model('Notification', notificationSchema);