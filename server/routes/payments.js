
const express = require('express');
const mongoose = require('mongoose');
const Razorpay = require('razorpay');
const crypto = require('crypto');

const { protect } = require('../middleware/auth');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');

const router = express.Router();

let razorpay;

function getRazorpay() {
  if (
    !process.env.RAZORPAY_KEY_ID ||
    !process.env.RAZORPAY_KEY_SECRET
  ) {
    throw new Error('Razorpay keys are not configured on the server.');
  }

  if (!razorpay) {
    razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  return razorpay;
}

// Create a payment order for a published paid course.
router.post('/create-order', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only student accounts can purchase courses.',
      });
    }

    const { courseId } = req.body;

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'A valid course ID is required.',
      });
    }

    const course = await Course.findById(courseId);

    if (!course || course.status !== 'Published') {
      return res.status(404).json({
        success: false,
        message: 'Published course not found.',
      });
    }

    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: course._id,
    });

    if (
      existingEnrollment &&
      existingEnrollment.enrollmentStatus === 'active'
    ) {
      return res.status(409).json({
        success: false,
        message: 'You are already enrolled in this course.',
      });
    }

    const price = Number(course.price);

    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({
        success: false,
        message: 'This course does not require a paid order.',
      });
    }

    const amount = Math.round(price * 100);

    if (!Number.isSafeInteger(amount) || amount < 1) {
      return res.status(400).json({
        success: false,
        message: 'Course price is invalid.',
      });
    }

    const client = getRazorpay();

    const order = await client.orders.create({
      amount,
      currency: 'INR',
      receipt: `course_${course._id}_${Date.now()}`,
      notes: {
        courseId: String(course._id),
        studentId: String(req.user._id),
      },
    });

    await Payment.create({
      student: req.user._id,
      course: course._id,
      razorpayOrderId: order.id,
      amount,
      currency: 'INR',
      status: 'created',
    });

    // Ensure there is a pending enrollment record.
    // This record does NOT grant course access.
    if (!existingEnrollment) {
      await Enrollment.create({
        student: req.user._id,
        course: course._id,
        enrollmentStatus: 'pending',
        paymentStatus: 'pending',
        amountPaid: 0,
        currency: 'INR',
        paymentProvider: 'razorpay',
        paymentOrderId: order.id,
      });
    } else {
      existingEnrollment.enrollmentStatus = 'pending';
      existingEnrollment.paymentStatus = 'pending';
      existingEnrollment.paymentProvider = 'razorpay';
      existingEnrollment.paymentOrderId = order.id;
      await existingEnrollment.save();
    }

    return res.status(201).json({
      success: true,
      message: 'Payment order created.',
      keyId: process.env.RAZORPAY_KEY_ID,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      course: {
        id: String(course._id),
        title: course.title,
        price,
      },
    });
  } catch (error) {
    console.error('Create payment order error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to create payment order.',
    });
  }
});

// Verify payment and activate enrollment only after confirmation.
router.post('/verify', protect, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can verify course purchases.',
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      typeof razorpay_order_id !== 'string' ||
      typeof razorpay_payment_id !== 'string' ||
      typeof razorpay_signature !== 'string' ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message: 'Payment verification details are incomplete.',
      });
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
      student: req.user._id,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment order not found for this student.',
      });
    }

    // Check server configuration before signature verification.
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay secret is not configured.');
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${payment.razorpayOrderId}|${razorpay_payment_id}`)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const receivedBuffer = /^[a-f0-9]{64}$/i.test(razorpay_signature)
      ? Buffer.from(razorpay_signature, 'hex')
      : Buffer.alloc(0);

    const signaturesMatch =
      expectedBuffer.length === receivedBuffer.length &&
      expectedBuffer.length > 0 &&
      crypto.timingSafeEqual(expectedBuffer, receivedBuffer);

    if (!signaturesMatch) {
      return res.status(400).json({
        success: false,
        message: 'Payment signature verification failed.',
      });
    }

    // Fetch the payment from Razorpay instead of trusting the browser.
    const client = getRazorpay();
    const razorpayPayment = await client.payments.fetch(
      razorpay_payment_id
    );

    if (
      razorpayPayment.order_id !== payment.razorpayOrderId ||
      razorpayPayment.status !== 'captured' ||
      razorpayPayment.amount !== payment.amount ||
      razorpayPayment.currency !== payment.currency
    ) {
      return res.status(400).json({
        success: false,
        message: 'Payment is not captured or does not match this order.',
      });
    }

    // Update an existing pending/cancelled enrollment or create one.
    // The unique student/course index prevents duplicate records.
    const enrollment = await Enrollment.findOneAndUpdate(
      {
        student: payment.student,
        course: payment.course,
      },
      {
        $set: {
          enrollmentStatus: 'active',
          paymentStatus: 'paid',
          amountPaid: payment.amount / 100,
          currency: payment.currency,
          paymentProvider: 'razorpay',
          paymentOrderId: payment.razorpayOrderId,
          paymentId: razorpay_payment_id,
          enrolledAt: new Date(),
        },
        $setOnInsert: {
          student: payment.student,
          course: payment.course,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.status = 'paid';
    payment.paidAt = new Date();
    await payment.save();

    return res.json({
      success: true,
      message: 'Payment verified and course access granted.',
      enrollment: {
        id: enrollment._id,
        course: enrollment.course,
        enrollmentStatus: enrollment.enrollmentStatus,
        paymentStatus: enrollment.paymentStatus,
      },
    });
  } catch (error) {
    console.error('Payment verification error:', error.message);

    return res.status(500).json({
      success: false,
      message: 'Unable to verify payment at this time.',
    });
  }
});

module.exports = router;
