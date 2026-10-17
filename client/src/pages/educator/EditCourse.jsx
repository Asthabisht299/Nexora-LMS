
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  fetchCourseById,
  updateCourse,
} from '../../services/courseApi';

const inputClass =
  'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-100';

const EditCourse = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    const loadCourse = async () => {
      try {
        setLoading(true);
        setError('');

        const found = await fetchCourseById(id);

        if (!active) return;

        setCourse({
          title: found.title || '',
          category: found.category || 'Development',
          description: found.description || '',
          price: found.price ?? 0,
          thumbnail: found.thumbnail || '',
          level: found.level || 'Beginner',
          language: found.language || 'English',
          status: found.status || 'Draft',
        });

        setLessons(
          Array.isArray(found.lessons) && found.lessons.length
            ? found.lessons.map((lesson) => ({
                id: lesson._id || `${Date.now()}-${Math.random()}`,
                title: lesson.title || '',
                description: lesson.description || '',
                videoUrl: lesson.videoUrl || '',
                duration: lesson.duration || '10 min',
                isPreview: Boolean(lesson.isPreview),
              }))
            : [
                {
                  id: `lesson-${Date.now()}`,
                  title: '',
                  description: '',
                  videoUrl: '',
                  duration: '10 min',
                  isPreview: false,
                },
              ]
        );
      } catch (err) {
        if (active) {
          setError(err.message || 'Unable to load this course.');
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCourse();

    return () => {
      active = false;
    };
  }, [id]);

  const handleCourseChange = (event) => {
    const { name, value } = event.target;

    setCourse((previous) => ({
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
    setLessons((previous) => [
      ...previous,
      {
        id: `lesson-${Date.now()}-${previous.length}`,
        title: '',
        description: '',
        videoUrl: '',
        duration: '10 min',
        isPreview: false,
      },
    ]);
  };

  const removeLesson = (index) => {
    setLessons((previous) =>
      previous.filter((_, i) => i !== index)
    );
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!course.title.trim() || !course.description.trim()) {
      setError('Please enter a course title and description.');
      return;
    }

    if (Number(course.price) < 0 || course.price === '') {
      setError('Please enter a valid course price.');
      return;
    }

    const validLessons = lessons
      .filter((lesson) => lesson.title.trim())
      .map((lesson) => ({
        title: lesson.title.trim(),
        description: lesson.description.trim(),
        videoUrl: lesson.videoUrl.trim(),
        duration: lesson.duration.trim() || '10 min',
        isPreview: lesson.isPreview,
      }));

    if (validLessons.length === 0) {
      setError('Please add at least one lesson with a title.');
      return;
    }

    setSaving(true);

    try {
      await updateCourse(id, {
        title: course.title.trim(),
        description: course.description.trim(),
        category: course.category,
        price: Number(course.price),
        thumbnail: course.thumbnail.trim(),
        level: course.level,
        language: course.language.trim() || 'English',
        status: course.status,
        lessons: validLessons,
      });

      setMessage('Course updated successfully!');

      setTimeout(() => {
        navigate('/educator/my-courses');
      }, 800);
    } catch (err) {
      setError(err.message || 'Failed to save course changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl p-8">
        <h1 className="text-2xl font-bold">Loading course...</h1>
      </main>
    );
  }

  if (error && !course) {
    return (
      <main className="mx-auto max-w-3xl p-8 text-center">
        <h1 className="text-2xl font-bold">Unable to open course</h1>
        <p className="mt-3 text-red-600">{error}</p>
        <Link
          to="/educator/my-courses"
          className="mt-5 inline-block rounded-xl bg-violet-600 px-5 py-3 text-white"
        >
          Back to My Courses
        </Link>
      </main>
    );
  }

  if (!course) return null;

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-wider text-violet-600">
          Educator Studio
        </p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">
          Edit Course
        </h1>
        <p className="mt-2 text-gray-500">
          Update your course information and curriculum.
        </p>
      </div>

      {message && (
        <div className="mb-5 rounded-xl bg-green-50 p-4 text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-semibold">
            Course Information
          </h2>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Course Title *
              </label>
              <input
                className={inputClass}
                name="title"
                value={course.title}
                onChange={handleCourseChange}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Category
              </label>
              <select
                className={inputClass}
                name="category"
                value={course.category}
                onChange={handleCourseChange}
              >
                {[
                  'Development',
                  'Design',
                  'Business',
                  'Marketing',
                  'Data Science',
                  'Personal Development',
                ].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Level
              </label>
              <select
                className={inputClass}
                name="level"
                value={course.level}
                onChange={handleCourseChange}
              >
                {[
                  'Beginner',
                  'Intermediate',
                  'Advanced',
                  'All Levels',
                ].map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Price (₹)
              </label>
              <input
                className={inputClass}
                type="number"
                min="0"
                name="price"
                value={course.price}
                onChange={handleCourseChange}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Language
              </label>
              <input
                className={inputClass}
                name="language"
                value={course.language}
                onChange={handleCourseChange}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Thumbnail URL
              </label>
              <input
                className={inputClass}
                type="url"
                name="thumbnail"
                value={course.thumbnail}
                onChange={handleCourseChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-medium">
                Description *
              </label>
              <textarea
                className={inputClass}
                name="description"
                rows="4"
                value={course.description}
                onChange={handleCourseChange}
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Publication Status
              </label>
              <select
                className={inputClass}
                name="status"
                value={course.status}
                onChange={handleCourseChange}
              >
                <option>Draft</option>
                <option>Published</option>
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">Course Lessons</h2>
              <p className="mt-1 text-sm text-gray-500">
                Manage lesson titles, notes, and video links.
              </p>
            </div>

            <button
              type="button"
              onClick={addLesson}
              className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              + Add Lesson
            </button>
          </div>

          <div className="space-y-5">
            {lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="rounded-xl border border-gray-200 bg-gray-50 p-5"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">
                    Lesson {index + 1}
                  </h3>

                  {lessons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLesson(index)}
                      className="text-sm font-medium text-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <input
                    className={inputClass}
                    value={lesson.title}
                    onChange={(event) =>
                      updateLesson(index, 'title', event.target.value)
                    }
                    placeholder="Lesson title"
                  />

                  <textarea
                    className={inputClass}
                    rows="3"
                    value={lesson.description}
                    onChange={(event) =>
                      updateLesson(
                        index,
                        'description',
                        event.target.value
                      )
                    }
                    placeholder="Lesson description or notes"
                  />

                  <input
                    className={inputClass}
                    type="url"
                    value={lesson.videoUrl}
                    onChange={(event) =>
                      updateLesson(
                        index,
                        'videoUrl',
                        event.target.value
                      )
                    }
                    placeholder="Video URL (optional)"
                  />

                  <input
                    className={inputClass}
                    value={lesson.duration}
                    onChange={(event) =>
                      updateLesson(
                        index,
                        'duration',
                        event.target.value
                      )
                    }
                    placeholder="Duration (e.g. 12 min)"
                  />

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={lesson.isPreview}
                      onChange={(event) =>
                        updateLesson(
                          index,
                          'isPreview',
                          event.target.checked
                        )
                      }
                    />
                    Allow as free preview
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/educator/my-courses')}
            className="rounded-xl border border-gray-300 px-5 py-3 font-semibold text-gray-700"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </main>
  );
};

export default EditCourse;
