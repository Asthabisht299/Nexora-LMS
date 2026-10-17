
const express = require('express');
const mongoose = require('mongoose');
const Course = require('../models/Course');
const { protect, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// Validate MongoDB IDs
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Fields educators are allowed to set
const allowedFields = [
  'title',
  'description',
  'category',
  'price',
  'thumbnail',
  'level',
  'language',
  'lessons',
  'status',
];

// Prevent clients from setting the educator ID or arbitrary database fields
const getCourseFields = (body) => {
  const data = {};

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      data[field] = body[field];
    }
  }

  return data;
};

const validateCourseData = (data) => {
  if (
    data.title !== undefined &&
    (typeof data.title !== 'string' || !data.title.trim())
  ) {
    return 'Course title is required.';
  }

  if (
    data.description !== undefined &&
    (typeof data.description !== 'string' || !data.description.trim())
  ) {
    return 'Course description must be valid text.';
  }

  if (
    data.category !== undefined &&
    (typeof data.category !== 'string' || !data.category.trim())
  ) {
    return 'Course category is required.';
  }

  if (
    data.price !== undefined &&
    (typeof data.price !== 'number' ||
      !Number.isFinite(data.price) ||
      data.price < 0)
  ) {
    return 'Price must be a valid non-negative number.';
  }

  if (
    data.status !== undefined &&
    !['Draft', 'Published'].includes(data.status)
  ) {
    return 'Status must be Draft or Published.';
  }

  if (
    data.level !== undefined &&
    !['Beginner', 'Intermediate', 'Advanced', 'All Levels'].includes(data.level)
  ) {
    return 'Please select a valid course level.';
  }

  if (
    data.lessons !== undefined &&
    (!Array.isArray(data.lessons) ||
      data.lessons.some(
        (lesson) =>
          !lesson ||
          typeof lesson.title !== 'string' ||
          !lesson.title.trim() ||
          (lesson.videoUrl !== undefined &&
            typeof lesson.videoUrl !== 'string') ||
          (lesson.description !== undefined &&
            typeof lesson.description !== 'string') ||
          (lesson.duration !== undefined &&
            typeof lesson.duration !== 'string') ||
          (lesson.isPreview !== undefined &&
            typeof lesson.isPreview !== 'boolean')
      ))
  ) {
    return 'Each lesson must have a title and valid lesson details.';
  }

  return null;
};

// GET /api/courses
// Anyone can view published courses
router.get('/', async (req, res) => {
  try {
    const courses = await Course.find({ status: 'Published' })
      .select('-lessons.videoUrl')
      .populate('educator', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      courses,
    });
  } catch (error) {
    console.error('Fetch courses error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch courses.',
    });
  }
});

// GET /api/courses/mine
// Educators can view their own courses, including drafts
router.get(
  '/mine',
  protect,
  authorizeRoles('educator'),
  async (req, res) => {
    try {
      const courses = await Course.find({ educator: req.user._id })
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        courses,
      });
    } catch (error) {
      console.error('Fetch educator courses error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Unable to fetch your courses.',
      });
    }
  }
);

// POST /api/courses
// Only educators can create courses
router.post(
  '/',
  protect,
  authorizeRoles('educator'),
  async (req, res) => {
    try {
      const data = getCourseFields(req.body);

      if (
        !data.title ||
        !data.description ||
        !data.category ||
        data.price === undefined
      ) {
        return res.status(400).json({
          success: false,
          message: 'Title, description, category, and price are required.',
        });
      }

      const validationError = validateCourseData(data);

      if (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError,
        });
      }

      const course = await Course.create({
        ...data,
        title: data.title.trim(),
        description: data.description.trim(),
        category: data.category.trim(),
        educator: req.user._id,
      });

      res.status(201).json({
        success: true,
        message: 'Course created successfully.',
        course,
      });
    } catch (error) {
      console.error('Create course error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Unable to create course.',
      });
    }
  }
);

// GET /api/courses/:id
// Published courses are public; drafts are visible only to their educator
router.get('/:id', async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid course ID.',
      });
    }

    const course = await Course.findById(req.params.id)
      .populate('educator', 'name');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found.',
      });
    }

    if (course.status !== 'Published') {
      const authHeader = req.headers.authorization;
      let currentUser = null;

      if (authHeader?.startsWith('Bearer ')) {
        try {
          const jwt = require('jsonwebtoken');
          const decoded = jwt.verify(
            authHeader.split(' ')[1],
            process.env.JWT_SECRET
          );

          currentUser = await require('../models/User')
            .findById(decoded.id)
            .select('_id role');
        } catch {
          currentUser = null;
        }
      }

      if (
        !currentUser ||
        currentUser.role !== 'educator' ||
        course.educator._id.toString() !== currentUser._id.toString()
      ) {
        return res.status(404).json({
          success: false,
          message: 'Course not found.',
        });
      }
    }

    // Do not send lesson video URLs through this public detail endpoint.
    const courseData = course.toObject();

    courseData.lessons = courseData.lessons.map((lesson) => {
      delete lesson.videoUrl;
      return lesson;
    });

    res.json({
      success: true,
      course: courseData,
    });
  } catch (error) {
    console.error('Fetch course error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch course.',
    });
  }
});

// PUT /api/courses/:id
// Only the educator who owns the course can update it
router.put(
  '/:id',
  protect,
  authorizeRoles('educator'),
  async (req, res) => {
    try {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid course ID.',
        });
      }

      const data = getCourseFields(req.body);

      if (Object.keys(data).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid course fields were provided.',
        });
      }

      const validationError = validateCourseData(data);

      if (validationError) {
        return res.status(400).json({
          success: false,
          message: validationError,
        });
      }

      if (data.title !== undefined) data.title = data.title.trim();
      if (data.description !== undefined) {
        data.description = data.description.trim();
      }
      if (data.category !== undefined) data.category = data.category.trim();

      const course = await Course.findOneAndUpdate(
        {
          _id: req.params.id,
          educator: req.user._id,
        },
        { $set: data },
        { new: true, runValidators: true }
      );

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found or you do not own this course.',
        });
      }

      res.json({
        success: true,
        message: 'Course updated successfully.',
        course,
      });
    } catch (error) {
      console.error('Update course error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Unable to update course.',
      });
    }
  }
);

// DELETE /api/courses/:id
// Only the owning educator can delete the course
router.delete(
  '/:id',
  protect,
  authorizeRoles('educator'),
  async (req, res) => {
    try {
      if (!isValidId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid course ID.',
        });
      }

      const course = await Course.findOneAndDelete({
        _id: req.params.id,
        educator: req.user._id,
      });

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Course not found or you do not own this course.',
        });
      }

      res.json({
        success: true,
        message: 'Course deleted successfully.',
      });
    } catch (error) {
      console.error('Delete course error:', error.message);
      res.status(500).json({
        success: false,
        message: 'Unable to delete course.',
      });
    }
  }
);

module.exports = router;