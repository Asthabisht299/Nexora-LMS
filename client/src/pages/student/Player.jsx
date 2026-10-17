
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchCourseById } from '../../services/courseApi';

const Player = () => {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadCourse = async () => {
      try {
        setLoading(true);
        setError('');

        const result = await fetchCourseById(courseId);
        const data = result.course || result.data || result;

        if (active) {
          setCourse(data);
          setSelectedLesson(0);
        }
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
  }, [courseId]);

  if (loading) {
    return (
      <main className="player-state">
        <div className="player-spinner" />
        <h2>Preparing your classroom...</h2>
        <p>Loading course information.</p>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="player-state">
        <div className="player-state-icon">!</div>
        <h2>Course unavailable</h2>
        <p>{error || 'We could not find this course.'}</p>
        <Link to="/courses" className="player-back-btn">
          Browse courses
        </Link>
      </main>
    );
  }

  const lessons = Array.isArray(course.lessons) ? course.lessons : [];
  const lesson = lessons[selectedLesson];
  const courseTitle = course.title || 'Your course';

  return (
    <main className="learning-page">
      <header className="learning-topbar">
        <Link to="/my-enrollments" className="learning-back">
          <span>←</span> My learning
        </Link>

        <div className="learning-brand">
          <span className="learning-brand-icon">N</span>
          <span>NEXORA <small>CLASSROOM</small></span>
        </div>

        <Link to="/courses" className="learning-explore">
          Explore courses
        </Link>
      </header>

      <section className="learning-heading">
        <div>
          <span className="learning-kicker">
            {course.category || 'ONLINE COURSE'}
          </span>
          <h1>{courseTitle}</h1>
          <p>
            {course.description ||
              'Your next learning milestone starts here.'}
          </p>
        </div>

        <div className="learning-course-badge">
          <span>✦</span>
          <div>
            <strong>{lessons.length}</strong>
            <small>COURSE LESSONS</small>
          </div>
        </div>
      </section>

      <section className="learning-layout">
        <div className="learning-main">
          <div className="learning-video-frame">
            {course.thumbnail ? (
              <img
                className="learning-cover"
                src={course.thumbnail}
                alt={courseTitle}
              />
            ) : (
              <div className="learning-cover-placeholder">
                <span>✦</span>
                <strong>NEXORA</strong>
                <small>YOUR LEARNING JOURNEY</small>
              </div>
            )}

            <div className="learning-video-overlay">
              <div className="learning-lock-icon">▣</div>
              <h2>Your learning space</h2>
              <p>
                Lesson access will appear here once enrollment and
                lesson authorization are connected.
              </p>
            </div>
          </div>

          <div className="learning-lesson-info">
            <div>
              <span className="learning-kicker">
                {lesson ? `LESSON ${selectedLesson + 1}` : 'COURSE OVERVIEW'}
              </span>
              <h2>{lesson?.title || 'Welcome to your course'}</h2>
              <p>
                {lesson?.description ||
                  'Explore the curriculum and get ready to start learning.'}
              </p>
            </div>
            <span className="learning-pending-badge">Access setup pending</span>
          </div>

          <div className="learning-notice">
            <span>ⓘ</span>
            <div>
              <strong>Lesson playback is not connected yet</strong>
              <p>
                This page currently displays course information only.
                It does not grant access to protected videos. We will
                connect secure lesson access after enrollment and
                payment verification are implemented.
              </p>
            </div>
          </div>

          <Link to="/my-enrollments" className="learning-return-link">
            ← Return to My Enrollments
          </Link>
        </div>

        <aside className="learning-sidebar">
          <div className="learning-sidebar-header">
            <div>
              <span className="learning-kicker">YOUR CURRICULUM</span>
              <h2>Course content</h2>
            </div>
            <span className="learning-count">{lessons.length}</span>
          </div>

          {lessons.length === 0 ? (
            <div className="learning-no-lessons">
              <span>▤</span>
              <strong>No lessons added yet</strong>
              <p>The educator can add lessons from the course editor.</p>
            </div>
          ) : (
            <div className="learning-lesson-list">
              {lessons.map((item, index) => (
                <button
                  key={item._id || index}
                  type="button"
                  className={`learning-lesson-item ${
                    selectedLesson === index ? 'active' : ''
                  }`}
                  onClick={() => setSelectedLesson(index)}
                >
                  <span className="learning-lesson-number">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <span className="learning-lesson-text">
                    <strong>{item.title || `Lesson ${index + 1}`}</strong>
                    <small>
                      {item.duration || 'Lesson'} 
                      {item.isPreview ? ' · Preview' : ''}
                    </small>
                  </span>

                  <span className="learning-lesson-lock">⌑</span>
                </button>
              ))}
            </div>
          )}

          <div className="learning-sidebar-footer">
            <span>✦</span>
            <p>Every skill begins with one lesson.</p>
          </div>
        </aside>
      </section>
    </main>
  );
};

export default Player;
