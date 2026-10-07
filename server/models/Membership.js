const mongoose = require('mongoose');

const DURATION_UNITS = ['days', 'weeks', 'months', 'years'];

const membershipSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Membership name is required'],
      trim: true,
      minlength: [3, 'Membership name must be at least 3 characters'],
      maxlength: [80, 'Membership name cannot exceed 80 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [600, 'Description cannot exceed 600 characters'],
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be greater than 0'],
    },
    durationUnit: {
      type: String,
      required: [true, 'Duration unit is required'],
      enum: {
        values: DURATION_UNITS,
        message: 'Duration unit must be one of: days, weeks, months, years',
      },
      default: 'months',
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    features: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => Array.isArray(v) && v.every((f) => typeof f === 'string'),
        message: 'Features must be a list of strings',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      default: 'Basic',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Useful indexes
membershipSchema.index({ name: 1 });
membershipSchema.index({ category: 1 });
membershipSchema.index({ price: 1 });
membershipSchema.index({ isActive: 1 });

module.exports = mongoose.model('Membership', membershipSchema);
