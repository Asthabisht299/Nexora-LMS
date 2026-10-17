
const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      default: '',
    },
    duration: {
      type: String,
      default: '10 min',
    },
    isPreview: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    thumbnail: {
      type: String,
      default: '',
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
      default: 'Beginner',
    },
    language: {
      type: String,
      default: 'English',
    },
    lessons: {
      type: [lessonSchema],
      default: [],
    },
    educator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Draft',
    },
  },
  { timestamps: true }
);

courseSchema.index({ status: 1, createdAt: -1 });
courseSchema.index({ educator: 1, createdAt: -1 });

module.exports = mongoose.model('Course', courseSchema);
