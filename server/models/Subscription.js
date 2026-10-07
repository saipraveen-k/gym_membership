const mongoose = require('mongoose');

const STATUSES = ['pending', 'approved', 'rejected', 'active', 'expired'];
const PAYMENT_STATUSES = ['unpaid', 'paid'];

const subscriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    membership: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Membership',
      required: [true, 'Membership is required'],
    },
    status: {
      type: String,
      enum: {
        values: STATUSES,
        message: 'Invalid application status',
      },
      default: 'pending',
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    paymentStatus: {
      type: String,
      enum: {
        values: PAYMENT_STATUSES,
        message: 'Payment status must be unpaid or paid',
      },
      default: 'unpaid',
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Useful indexes
subscriptionSchema.index({ user: 1 });
subscriptionSchema.index({ membership: 1 });
subscriptionSchema.index({ status: 1 });
subscriptionSchema.index({ user: 1, membership: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);
