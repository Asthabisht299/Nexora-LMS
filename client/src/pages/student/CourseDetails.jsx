import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchCourseById } from '../../services/courseApi';
import { purchaseCourse } from '../../services/paymentApi';

export default function CourseDetails() {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // Payment states
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');

  // Handle paid course purchase
  const handlePurchase = async () => {
    try {
      setPaymentLoading(true);
      setPaymentError('');
      setPaymentSuccess('');

      const result = await purchaseCourse(id);

      setPaymentSuccess(
        result.message || 'Payment verified successfully!'
      );
    } catch (error) {
      setPaymentError(
        error.message || 'Unable to complete payment.'
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadCourse() {
      try {
        setLoading(true);
        setError('');

        const data = await fetchCourseById(id);

        if (!cancelled) {
          setCourse(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to load this course.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadCourse();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="course-detail-page">
        <div className="course-detail-state">
          <div className="course-detail-spinner" />
          <h2>Preparing your learning experience...</h2>
          <p>Loading course information.</p>
        </div>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="course-detail-page">
        <div className="course-detail-state">
          <span className="course-detail-state-icon">!</span>
          <h2>We couldn't open this course.</h2>
          <p>{error || 'The requested course could not be found.'}</p>
          <Link className="course-detail-button" to="/courses">
            Browse courses
          </Link>
        </div>
      </main>
    );
  }

  const price = Number(course.price || 0);
  const lessons = Array.isArray(course.lessons) ? course.lessons : [];

  const instructor =
    typeof course.educator === 'object' && course.educator !== null
      ? course.educator.name
      : null;

  return (
    <main className="course-detail-page">
      <div className="course-detail-breadcrumb">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/courses">Courses</Link>
        <span>/</span>
        <span className="course-breadcrumb-current">
          {course.title}
        </span>
      </div>

      <section className="course-detail-hero">
        <div className="course-detail-hero-content">
          <div className="course-detail-tags">
            <span>{course.category || 'General'}</span>
            <span>{course.level || 'All levels'}</span>
          </div>

          <h1>{course.title}</h1>

          <p className="course-detail-intro">
            {course.description ||
              'Explore this course and build practical skills at your own pace.'}
          </p>

          <div className="course-detail-meta">
            <span>◷ {lessons.length} lessons</span>
            <span>◎ {course.language || 'English'}</span>
            {instructor && <span>✦ {instructor}</span>}
          </div>

          <div className="course-detail-hero-actions">
            <a href="#course-enrollment" className="course-detail-button">
              {price <= 0 ? 'Enroll for free' : 'Get started'} <span>↗</span>
            </a>
            <span className="course-detail-trust">
              Learn at your own pace
            </span>
          </div>
        </div>

        <div className="course-detail-visual">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={course.title} />
          ) : (
            <div className="course-detail-placeholder">
              <span>✳</span>
              <strong>NEXORA</strong>
              <small>YOUR NEXT CHAPTER STARTS HERE</small>
            </div>
          )}

          <div className="course-visual-badge">
            <span>✦</span>
            <div>
              <strong>Invest in yourself</strong>
              <small>Your learning journey starts here</small>
            </div>
          </div>
        </div>
      </section>

      <section className="course-detail-layout">
        <div className="course-detail-main">
          <div className="course-detail-tabs">
            <button
              className={activeTab === 'overview' ? 'active' : ''}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>

            <button
              className={activeTab === 'curriculum' ? 'active' : ''}
              onClick={() => setActiveTab('curriculum')}
            >
              Curriculum ({lessons.length})
            </button>
          </div>

          {activeTab === 'overview' ? (
            <section className="course-detail-section">
              <span className="course-detail-section-label">
                ABOUT THIS COURSE
              </span>

              <h2>What you'll learn</h2>

              <p>
                {course.description ||
                  'Build your understanding step by step through the course lessons.'}
              </p>

              <div className="course-learning-points">
                <div><span>✓</span> Learn at a beginner-friendly pace</div>
                <div><span>✓</span> Follow a structured lesson plan</div>
                <div><span>✓</span> Revisit your learning as you progress</div>
              </div>

              <h2 className="course-about-heading">
                Course information
              </h2>

              <div className="course-information-grid">
                <div>
                  <span>Category</span>
                  <strong>{course.category || 'General'}</strong>
                </div>

                <div>
                  <span>Difficulty</span>
                  <strong>{course.level || 'All levels'}</strong>
                </div>

                <div>
                  <span>Language</span>
                  <strong>{course.language || 'English'}</strong>
                </div>

                <div>
                  <span>Lessons</span>
                  <strong>{lessons.length}</strong>
                </div>
              </div>
            </section>
          ) : (
            <section className="course-detail-section">
              <span className="course-detail-section-label">
                YOUR LEARNING PATH
              </span>

              <h2>Course curriculum</h2>

              <p className="course-curriculum-note">
                {lessons.length > 0
                  ? `${lessons.length} lessons in this course`
                  : 'The instructor has not added lessons yet.'}
              </p>

              {lessons.length > 0 && (
                <div className="course-lesson-list">
                  {lessons.map((lesson, index) => (
                    <div
                      className="course-lesson-row"
                      key={lesson._id || index}
                    >
                      <span className="course-lesson-number">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <div>
                        <strong>
                          {lesson.title || `Lesson ${index + 1}`}
                        </strong>

                        <p>
                          {lesson.description || 'Course lesson'}
                          {lesson.duration
                            ? ` · ${lesson.duration} min`
                            : ''}
                        </p>
                      </div>

                      <span className="course-lesson-lock">
                        {lesson.isPreview ? 'Preview' : 'Lesson'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>

        <aside className="course-enrollment-card" id="course-enrollment">
          <div className="course-enrollment-card-top">
            <span>COURSE ACCESS</span>

            <span className="course-enrollment-status">
              {price <= 0 ? 'FREE' : 'PREMIUM'}
            </span>
          </div>

          <div className="course-enrollment-price">
            {price <= 0
              ? 'Free'
              : `₹${price.toLocaleString('en-IN')}`}
          </div>

          <p className="course-enrollment-caption">
            {price <= 0
              ? 'Start learning without a course fee.'
              : 'Purchase access to begin your learning journey.'}
          </p>

          {price <= 0 ? (
            <button
              type="button"
              className="course-detail-button course-enroll-button"
              onClick={() => {
                window.alert(
                  'Free enrollment connection is the next step. This button does not enroll you yet.'
                );
              }}
            >
              Enroll for Free ↗
            </button>
          ) : (
            <button
              type="button"
              className="course-detail-button course-enroll-button"
              onClick={handlePurchase}
              disabled={paymentLoading}
            >
              {paymentLoading
                ? 'Processing...'
                : 'Continue to Payment ↗'}
            </button>
          )}

          {paymentError && (
            <p
              role="alert"
              style={{ color: '#dc2626', marginTop: '12px' }}
            >
              {paymentError}
            </p>
          )}

          {paymentSuccess && (
            <p
              role="status"
              style={{ color: '#059669', marginTop: '12px' }}
            >
              {paymentSuccess}
            </p>
          )}

          <div className="course-enrollment-benefits">
            <div><span>✓</span> Structured course lessons</div>
            <div><span>✓</span> Learn at your own pace</div>
            <div><span>✓</span> Track your learning journey</div>
          </div>

          <div className="course-enrollment-help">
            <span>Need help?</span>
            <p>Check the course details before getting started.</p>
          </div>
        </aside>
      </section>

      <div className="course-detail-back">
        <Link to="/courses">← Back to all courses</Link>
      </div>
    </main>
  );
}