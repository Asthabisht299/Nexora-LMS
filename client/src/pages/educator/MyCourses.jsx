
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  fetchMyCourses,
  updateCourse,
  deleteCourse as deleteCourseApi,
} from '../../services/courseApi';

const courseColors = [
  '#7c3aed', '#0891b2', '#059669',
  '#ea580c', '#2563eb', '#db2777',
];

const courseIcons = {
  Design: '🎨',
  Development: '⚛️',
  'Data Science': '📊',
  Marketing: '📈',
  Business: '💼',
  'Personal Development': '🌱',
};

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState('');

  const loadCourses = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await fetchMyCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Unable to load courses.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const filteredCourses = useMemo(() => {
    const query = search.toLowerCase().trim();

    return courses.filter((course) => {
      const matchesSearch =
        (course.title || '').toLowerCase().includes(query) ||
        (course.category || '').toLowerCase().includes(query);

      const matchesFilter =
        filter === 'All' || course.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [courses, search, filter]);

  const publishedCount = courses.filter(
    (course) => course.status === 'Published'
  ).length;

  const draftCount = courses.filter(
    (course) => course.status === 'Draft'
  ).length;

  const totalStudents = courses.reduce(
    (total, course) => total + (Number(course.students) || 0),
    0
  );

  const handlePublish = async (course) => {
    const id = course._id || course.id;
    const newStatus =
      course.status === 'Published' ? 'Draft' : 'Published';

    setBusyId(String(id));
    setMessage('');
    setError('');

    try {
      const updated = await updateCourse(id, {
        status: newStatus,
      });

      setCourses((previous) =>
        previous.map((item) =>
          String(item._id || item.id) === String(id)
            ? { ...item, ...updated, status: newStatus }
            : item
        )
      );

      setMessage(
        `Course ${newStatus === 'Published' ? 'published' : 'unpublished'} successfully.`
      );
    } catch (err) {
      setError(err.message || 'Could not update course status.');
    } finally {
      setBusyId('');
    }
  };

  const handleDelete = async (course) => {
    const id = course._id || course.id;

    if (!window.confirm(`Delete "${course.title}" permanently?`)) {
      return;
    }

    setBusyId(String(id));
    setMessage('');
    setError('');

    try {
      await deleteCourseApi(id);

      setCourses((previous) =>
        previous.filter(
          (item) => String(item._id || item.id) !== String(id)
        )
      );

      setMessage('Course deleted successfully.');
    } catch (err) {
      setError(err.message || 'Could not delete course.');
    } finally {
      setBusyId('');
    }
  };

  if (loading) {
    return (
      <main className="educator-courses-page">
        <h1>My Courses</h1>
        <p>Loading courses from MongoDB...</p>
      </main>
    );
  }

  return (
    <main className="educator-courses-page">
      <div className="educator-courses-header">
        <div>
          <span className="educator-courses-eyebrow">
            EDUCATOR WORKSPACE
          </span>
          <h1>My Courses</h1>
          <p>Manage, publish, edit, and delete your courses.</p>
        </div>

        <Link
          to="/educator/add-course"
          className="educator-create-course-btn"
        >
          + Create New Course
        </Link>
      </div>

      {(message || error) && (
        <div className="educator-courses-message" role="status">
          <span>{error || message}</span>
          <button
            type="button"
            onClick={() => {
              setMessage('');
              setError('');
            }}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      <div className="educator-courses-stats">
        <div className="educator-course-stat">
          <span>Total Courses</span>
          <strong>{courses.length}</strong>
          <small>In your database</small>
        </div>

        <div className="educator-course-stat">
          <span>Published Courses</span>
          <strong>{publishedCount}</strong>
          <small>Visible in the catalogue</small>
        </div>

        <div className="educator-course-stat">
          <span>Total Students</span>
          <strong>{totalStudents.toLocaleString('en-IN')}</strong>
          <small>Reported enrollments</small>
        </div>

        <div className="educator-course-stat">
          <span>Draft Courses</span>
          <strong>{draftCount}</strong>
          <small>Not published</small>
        </div>
      </div>

      <div className="educator-courses-toolbar">
        <div className="educator-courses-search">
          <span>⌕</span>
          <input
            type="text"
            placeholder="Search courses or categories..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="educator-courses-filters">
          {['All', 'Published', 'Draft'].map((status) => (
            <button
              type="button"
              key={status}
              className={filter === status ? 'active' : ''}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="educator-courses-results">
        <h2>Your learning content</h2>
        <span>{filteredCourses.length} courses found</span>
      </div>

      {filteredCourses.length > 0 ? (
        <div className="educator-my-courses-grid">
          {filteredCourses.map((course, index) => {
            const id = course._id || course.id;
            const color = courseColors[index % courseColors.length];
            const icon = courseIcons[course.category] || '📚';
            const isBusy = busyId === String(id);

            const lessonCount = Array.isArray(course.lessons)
              ? course.lessons.length
              : Number(course.lessons) || 0;

            return (
              <article
                className="educator-my-course-card"
                key={id}
              >
                <div
                  className="educator-my-course-cover"
                  style={{
                    background: `linear-gradient(135deg, ${color}, ${color}bb)`,
                  }}
                >
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                      }}
                      onError={(event) => {
                        event.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <span className="educator-my-course-icon">
                      {icon}
                    </span>
                  )}

                  <span
                    className={`educator-my-course-status ${
                      course.status === 'Published'
                        ? 'published'
                        : 'draft'
                    }`}
                  >
                    {course.status || 'Draft'}
                  </span>
                </div>

                <div className="educator-my-course-content">
                  <span className="educator-my-course-category">
                    {course.category}
                  </span>

                  <h3>{course.title}</h3>

                  <div className="educator-my-course-meta">
                    <span>📚 {lessonCount} lessons</span>
                    <span>
                      👥 {Number(course.students) || 0} students
                    </span>
                  </div>

                  <div className="educator-my-course-price">
                    ₹{(Number(course.price) || 0).toLocaleString('en-IN')}
                  </div>

                  <div className="educator-my-course-actions">
                    <Link
                      to={`/educator/edit-course/${id}`}
                      className="educator-course-edit-btn"
                    >
                      Edit Course
                    </Link>

                    <button
                      type="button"
                      className="educator-course-status-btn"
                      disabled={isBusy}
                      onClick={() => handlePublish(course)}
                    >
                      {isBusy
                        ? 'Please wait...'
                        : course.status === 'Published'
                          ? 'Unpublish'
                          : 'Publish'}
                    </button>

                    <button
                      type="button"
                      className="educator-course-delete-btn"
                      disabled={isBusy}
                      onClick={() => handleDelete(course)}
                      aria-label={`Delete ${course.title}`}
                      title="Delete course"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="educator-courses-empty">
          <span>📚</span>
          <h3>{error ? 'Could not load courses' : 'No courses found'}</h3>
          <p>
            {error
              ? 'Check your educator login and backend server.'
              : 'Try a different search or create a new course.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setFilter('All');
            }}
          >
            Clear Filters
          </button>
          {error && (
            <button type="button" onClick={loadCourses}>
              Retry
            </button>
          )}
        </div>
      )}
    </main>
  );
};

export default MyCourses;
