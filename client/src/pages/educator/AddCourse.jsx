
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCourse } from '../../services/courseApi';

const initialForm = {
  title: '',
  description: '',
  category: 'Development',
  price: '0',
  thumbnail: '',
  level: 'Beginner',
  language: 'English',
  status: 'Draft',
};

const newLesson = () => ({
  title: '',
  description: '',
  videoUrl: '',
  duration: '10 min',
  isPreview: false,
});

const AddCourse = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState(initialForm);
  const [lessons, setLessons] = useState([newLesson()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const updateLesson = (index, field, value) => {
    setLessons((previous) =>
      previous.map((lesson, i) =>
        i === index ? { ...lesson, [field]: value } : lesson
      )
    );
  };

  const addLesson = () => {
    setLessons((previous) => [...previous, newLesson()]);
  };

  const removeLesson = (index) => {
    setLessons((previous) => previous.filter((_, i) => i !== index));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.category.trim()
    ) {
      setError('Please complete all required course information.');
      return;
    }

    const price = Number(formData.price);

    if (!Number.isFinite(price) || price < 0) {
      setError('Enter a valid course price.');
      return;
    }

    if (formData.thumbnail.trim()) {
      try {
        const url = new URL(formData.thumbnail.trim());
        if (!['http:', 'https:'].includes(url.protocol)) {
          throw new Error('Invalid protocol');
        }
      } catch {
        setError('Enter a valid HTTP or HTTPS thumbnail URL.');
        return;
      }
    }

    const cleanedLessons = [];

    for (let i = 0; i < lessons.length; i += 1) {
      const lesson = lessons[i];

      // Ignore a completely empty optional lesson.
      if (
        !lesson.title.trim() &&
        !lesson.videoUrl.trim() &&
        !lesson.description.trim()
      ) {
        continue;
      }

      if (!lesson.title.trim()) {
        setError(`Please enter a title for lesson ${i + 1}.`);
        return;
      }

      if (lesson.videoUrl.trim()) {
        try {
          const url = new URL(lesson.videoUrl.trim());
          if (!['http:', 'https:'].includes(url.protocol)) {
            throw new Error('Invalid protocol');
          }
        } catch {
          setError(`Enter a valid HTTP or HTTPS video URL for lesson ${i + 1}.`);
          return;
        }
      }

      cleanedLessons.push({
        title: lesson.title.trim(),
        description: lesson.description.trim(),
        videoUrl: lesson.videoUrl.trim(),
        duration: lesson.duration.trim() || '10 min',
        isPreview: Boolean(lesson.isPreview),
      });
    }

    const courseData = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      category: formData.category,
      price,
      thumbnail: formData.thumbnail.trim(),
      level: formData.level,
      language: formData.language.trim() || 'English',
      status: formData.status,
      lessons: cleanedLessons,
    };

    try {
      setLoading(true);

      const course = await createCourse(courseData);

      setSuccess(
        `Course "${course.title}" ${
          formData.status === 'Published'
            ? 'published'
            : 'saved as a draft'
        } successfully!`
      );

      navigate('/educator/my-courses', {
        replace: true,
        state: { message: `Course "${course.title}" saved successfully.` },
      });
    } catch (err) {
      setError(err.message || 'Unable to save the course.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-course-page">
      <div className="add-course-header">
        <div>
          <p className="add-course-eyebrow">NEXORA · EDUCATOR STUDIO</p>
          <h1>Create a course</h1>
          <p>
            Share your expertise with learners by building a structured course.
          </p>
        </div>
      </div>

      <form className="add-course-form" onSubmit={handleSubmit}>
        {error && (
          <div className="course-form-message error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="course-form-message success" role="status">
            {success}
          </div>
        )}

        <section className="add-course-section">
          <h2>01 · Course information</h2>
          <p className="add-course-hint">
            These details appear in the student course catalogue.
          </p>

          <label htmlFor="title">Course title *</label>
          <input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Complete React Mastery"
            maxLength={150}
            required
          />

          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Explain what learners will learn and build."
            rows={5}
            maxLength={10000}
            required
          />

          <div className="add-course-two-columns">
            <div>
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="Development">Development</option>
                <option value="Design">Design</option>
                <option value="Data Science">Data Science</option>
                <option value="Marketing">Marketing</option>
                <option value="Business">Business</option>
                <option value="Personal Development">
                  Personal Development
                </option>
              </select>
            </div>

            <div>
              <label htmlFor="price">Price (₹) *</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                step="1"
                value={formData.price}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label htmlFor="level">Difficulty level</label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>

            <div>
              <label htmlFor="language">Language</label>
              <input
                id="language"
                name="language"
                value={formData.language}
                onChange={handleChange}
                placeholder="English"
                maxLength={50}
              />
            </div>
          </div>

          <label htmlFor="thumbnail">Thumbnail image URL</label>
          <input
            id="thumbnail"
            name="thumbnail"
            type="url"
            value={formData.thumbnail}
            onChange={handleChange}
            placeholder="https://example.com/course-image.jpg"
          />
          <p className="add-course-hint">
            Optional. Use an image URL accessible to your students.
          </p>
        </section>

        <section className="add-course-section">
          <div className="curriculum-heading">
            <div>
              <h2>02 · Course curriculum</h2>
              <p className="add-course-hint">
                Add lessons individually, with optional video links.
              </p>
            </div>

            <button
              type="button"
              className="add-course-cancel"
              onClick={addLesson}
              disabled={loading}
            >
              + Add lesson
            </button>
          </div>

          {lessons.map((lesson, index) => (
            <div className="curriculum-lesson" key={index}>
              <div className="curriculum-lesson-heading">
                <h3>Lesson {index + 1}</h3>

                <button
                  type="button"
                  className="remove-lesson-button"
                  onClick={() => removeLesson(index)}
                  disabled={loading}
                  aria-label={`Remove lesson ${index + 1}`}
                >
                  Remove
                </button>
              </div>

              <label htmlFor={`lesson-title-${index}`}>
                Lesson title
              </label>
              <input
                id={`lesson-title-${index}`}
                value={lesson.title}
                onChange={(event) =>
                  updateLesson(index, 'title', event.target.value)
                }
                placeholder="e.g. Introduction to React"
                maxLength={200}
              />

              <label htmlFor={`lesson-description-${index}`}>
                Lesson description
              </label>
              <textarea
                id={`lesson-description-${index}`}
                value={lesson.description}
                onChange={(event) =>
                  updateLesson(index, 'description', event.target.value)
                }
                placeholder="What does this lesson cover?"
                rows={2}
                maxLength={2000}
              />

              <label htmlFor={`lesson-video-${index}`}>
                Video URL
              </label>
              <input
                id={`lesson-video-${index}`}
                type="url"
                value={lesson.videoUrl}
                onChange={(event) =>
                  updateLesson(index, 'videoUrl', event.target.value)
                }
                placeholder="https://..."
              />

              <label htmlFor={`lesson-duration-${index}`}>
                Duration
              </label>
              <input
                id={`lesson-duration-${index}`}
                value={lesson.duration}
                onChange={(event) =>
                  updateLesson(index, 'duration', event.target.value)
                }
                placeholder="e.g. 12 min"
                maxLength={30}
              />

              <label className="lesson-preview-toggle">
                <input
                  type="checkbox"
                  checked={lesson.isPreview}
                  onChange={(event) =>
                    updateLesson(index, 'isPreview', event.target.checked)
                  }
                />
                Allow free preview
              </label>
            </div>
          ))}

          <p className="add-course-hint">
            Video links are currently stored as URLs. Protected playback and
            enrollment checks will be implemented in the learning-player stage.
          </p>
        </section>

        <section className="add-course-section">
          <h2>03 · Publishing</h2>

          <label htmlFor="status">Course status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Draft">Save as draft</option>
            <option value="Published">Publish course</option>
          </select>

          <p className="add-course-hint">
            Draft courses should remain private. Published courses can appear
            in the student catalogue.
          </p>
        </section>

        <div className="add-course-actions">
          <button
            type="button"
            className="add-course-cancel"
            onClick={() => navigate('/educator/my-courses')}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="add-course-submit"
            disabled={loading}
          >
            {loading
              ? 'Saving...'
              : formData.status === 'Published'
                ? 'Publish course'
                : 'Save draft'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddCourse;
