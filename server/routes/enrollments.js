const express = require('express');
const mongoose = require('mongoose');

const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { protect, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// GET: Fetch enrollments for the logged-in student
router.get(
  '/mine',
  protect,
  authorizeRoles('student'),
  async (req, res) => {
    try {
      const enrollments = await Enrollment.find({
        student: req.user._id,
      })
        .populate({
          path: 'course',
          select: 'title description category price thumbnail level status educator',
          populate: {
            path: 'educator',
            select: 'name',
          },
        })
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        enrollments,
      });
    } catch (error) {
      console.error('Fetch enrollments error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to fetch enrollments.',
      });
    }
  }
);

// POST: Request enrollment in a published course
router.post(
  '/:courseId',
  protect,
  authorizeRoles('student'),
  async (req, res) => {
    try {
      const { courseId } = req.params;

      if (!mongoose.Types.ObjectId.isValid(courseId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid course ID.',
        });
      }

      const course = await Course.findOne({
        _id: courseId,
        status: 'Published',
      }).select('_id title price');

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Published course not found.',
        });
      }

      let enrollment = await Enrollment.findOne({
        student: req.user._id,
        course: course._id,
      });

      // Return the existing record instead of creating a duplicate.
      if (enrollment && enrollment.enrollmentStatus === 'active') {
        return res.status(200).json({
          success: true,
          message: 'You are already enrolled in this course.',
          enrollment,
        });
      }

      if (enrollment && enrollment.enrollmentStatus === 'pending') {
        return res.status(200).json({
          success: true,
          message: 'Your enrollment is pending payment verification.',
          enrollment,
        });
      }

      const isFree = Number(course.price) <= 0;

      if (enrollment) {
        // Reactivate a cancelled record.
        enrollment.enrollmentStatus = isFree ? 'active' : 'pending';
        enrollment.paymentStatus = isFree ? 'not_required' : 'pending';
        enrollment.amountPaid = 0;
        enrollment.paymentProvider = '';
        enrollment.paymentOrderId = '';
        enrollment.paymentId = '';
        enrollment.enrolledAt = isFree ? new Date() : null;

        await enrollment.save();
      } else {
        enrollment = await Enrollment.create({
          student: req.user._id,
          course: course._id,
          enrollmentStatus: isFree ? 'active' : 'pending',
          paymentStatus: isFree ? 'not_required' : 'pending',
          amountPaid: 0,
          currency: 'INR',
          enrolledAt: isFree ? new Date() : null,
        });
      }

      return res.status(201).json({
        success: true,
        message: isFree
          ? 'Enrollment successful.'
          : 'Enrollment created. Complete payment to access this course.',
        enrollment,
      });
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'An enrollment record already exists for this course.',
        });
      }

      console.error('Create enrollment error:', error);

      return res.status(500).json({
        success: false,
        message: 'Failed to create enrollment.',
      });
    }
  }
);

module.exports = router;