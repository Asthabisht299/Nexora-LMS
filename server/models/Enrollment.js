const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
      index: true,
    },

    enrollmentStatus: {
      type: String,
      enum: ['pending', 'active', 'cancelled'],
      default: 'pending',
    },

    paymentStatus: {
      type: String,
      enum: ['not_required', 'pending', 'paid', 'failed'],
      default: 'pending',
    },

    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },

    currency: {
      type: String,
      default: 'INR',
    },

    paymentProvider: {
      type: String,
      default: '',
    },

    paymentOrderId: {
      type: String,
      default: '',
    },

    paymentId: {
      type: String,
      default: '',
    },

    enrolledAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate enrollment records for the same student and course.
enrollmentSchema.index(
  { student: 1, course: 1 },
  { unique: true }
);

module.exports = mongoose.model('Enrollment', enrollmentSchema);