
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyCourses } from '../../services/courseApi';

const Dashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    const loadCourses = async () => {
      try {
        const result = await fetchMyCourses();
        const data = Array.isArray(result)
          ? result
          : result.courses || result.data || [];

        if (active) setCourses(data);
      } catch (err) {
        if (active) setError(err.message || 'Unable to load your courses.');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCourses();

    return () => {
      active = false;
    };
  }, []);

  const publishedCourses = courses.filter(
    course => course.status === 'Published'
  ).length;

  const draftCourses = courses.filter(
    course => course.status !== 'Published'
  ).length;

  const totalStudents = courses.reduce(
    (sum, course) => sum + (Number(course.students) || 0),
    0
  );

  const totalRevenue = courses.reduce(
    (sum, course) =>
      sum + (Number(course.price) || 0) * (Number(course.students) || 0),
    0
  );

  const stats = [
    {
      label: 'Total courses',
      value: loading ? '—' : courses.length,
      icon: '▤',
      className: 'studio-purple',
      note: 'Your course library',
    },
    {
      label: 'Published courses',
      value: loading ? '—' : publishedCourses,
      icon: '↗',
      className: 'studio-green',
      note: 'Visible in the catalog',
    },
    {
      label: 'Total students',
      value: loading ? '—' : totalStudents.toLocaleString('en-IN'),
      icon: '♧',
      className: 'studio-blue',
      note: 'Reported course totals',
    },
    {
      label: 'Estimated revenue',
      value: loading
        ? '—'
        : `₹${totalRevenue.toLocaleString('en-IN')}`,
      icon: '₹',
      className: 'studio-orange',
      note: 'Estimate, not verified payouts',
    },
  ];

  const formatPrice = price =>
    `₹${(Number(price) || 0).toLocaleString('en-IN')}`;

  return (
    <main className="studio-dashboard">
      <section className="studio-welcome">
        <div className="studio-welcome-copy">
          <div className="studio-eyebrow">
            <span className="studio-live-dot" />
            EDUCATOR WORKSPACE
          </div>

          <h1>
            Create something <span>extraordinary.</span>
          </h1>

          <p>
            Manage your courses, organize your content, and build
            meaningful learning experiences — all from one place.
          </p>

          <div className="studio-welcome-actions">
            <Link to="/educator/add-course" className="studio-primary-btn">
              <span>＋</span> Create a course
            </Link>

            <Link to="/educator/my-courses" className="studio-hero-link">
              Explore my courses <span>↗</span>
            </Link>
          </div>
        </div>

        <div className="studio-hero-art" aria-hidden="true">
          <div className="studio-hero-ring studio-ring-one" />
          <div className="studio-hero-ring studio-ring-two" />

          <div className="studio-hero-card">
            <div className="studio-hero-card-top">
              <span>✦</span>
              <span>YOUR STUDIO</span>
            </div>
            <div className="studio-hero-chart">
              <i style={{ height: '30%' }} />
              <i style={{ height: '48%' }} />
              <i style={{ height: '40%' }} />
              <i style={{ height: '68%' }} />
              <i style={{ height: '55%' }} />
              <i style={{ height: '85%' }} />
            </div>
            <div className="studio-hero-card-bottom">
              <span>Ideas become impact.</span>
              <strong>✧</strong>
            </div>
          </div>

          <div className="studio-floating-badge">✦ Learn. Create.</div>
          <div className="studio-floating-check">✓</div>
        </div>
      </section>

      <section className="studio-section">
        <div className="studio-section-heading">
          <div>
            <span className="studio-kicker">YOUR OVERVIEW</span>
            <h2>Studio at a glance</h2>
            <p>A quick look at your teaching workspace.</p>
          </div>

          <span className="studio-updated-label">
            <span /> {loading ? 'Syncing data' : 'Course overview'}
          </span>
        </div>

        <div className="studio-stats-grid">
          {stats.map((stat, index) => (
            <article
              className="studio-stat-card"
              key={stat.label}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className={`studio-stat-icon ${stat.className}`}>
                {stat.icon}
              </div>

              <span className="studio-stat-label">{stat.label}</span>
              <strong className="studio-stat-value">{stat.value}</strong>
              <span className="studio-stat-note">{stat.note}</span>
              <div className={`studio-stat-accent ${stat.className}`} />
            </article>
          ))}
        </div>
      </section>

      <section className="studio-workspace-grid">
        <div className="studio-panel studio-courses-panel">
          <div className="studio-panel-heading">
            <div>
              <span className="studio-kicker">CONTENT MANAGEMENT</span>
              <h2>Your courses</h2>
              <p>Manage the content you're building.</p>
            </div>

            <Link to="/educator/my-courses" className="studio-view-link">
              View all <span>→</span>
            </Link>
          </div>

          {loading ? (
            <div className="studio-message">
              <div className="studio-loader" />
              <p>Loading your course library...</p>
            </div>
          ) : error ? (
            <div className="studio-message">
              <div className="studio-message-icon">!</div>
              <h3>Couldn't load your courses</h3>
              <p>{error}</p>
              <button
                className="studio-retry-btn"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            </div>
          ) : courses.length === 0 ? (
            <div className="studio-empty">
              <div className="studio-empty-icon">✧</div>
              <h3>Your next great course starts here.</h3>
              <p>
                You haven't created a course yet. Start with an idea
                and turn it into a learning experience.
              </p>
              <Link to="/educator/add-course" className="studio-primary-btn">
                ＋ Create your first course
              </Link>
            </div>
          ) : (
            <div className="studio-course-list">
              {courses.slice(0, 5).map((course, index) => (
                <article
                  className="studio-course-row"
                  key={course._id || course.id || index}
                >
                  <div className={`studio-course-art art-${index % 4}`}>
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt="" />
                    ) : (
                      <span>
                        {['✦', '▤', '⌘', '◈'][index % 4]}
                      </span>
                    )}
                  </div>

                  <div className="studio-course-info">
                    <h3>{course.title || 'Untitled course'}</h3>
                    <p>
                      {course.category || 'General'} <span>·</span>{' '}
                      {Array.isArray(course.lessons)
                        ? course.lessons.length
                        : Number(course.totalLessons) || 0}{' '}
                      lessons
                    </p>
                  </div>

                  <div className="studio-course-price">
                    {formatPrice(course.price)}
                  </div>

                  <span
                    className={`studio-status ${
                      course.status === 'Published'
                        ? 'studio-status-published'
                        : 'studio-status-draft'
                    }`}
                  >
                    {course.status || 'Draft'}
                  </span>

                  <Link
                    to={`/educator/edit-course/${course._id || course.id}`}
                    className="studio-edit-link"
                    aria-label={`Edit ${course.title || 'course'}`}
                  >
                    ↗
                  </Link>
                </article>
              ))}
            </div>
          )}

          {!loading && !error && courses.length > 0 && (
            <div className="studio-course-list-footer">
              <span>
                Showing {Math.min(courses.length, 5)} of {courses.length} courses
              </span>
              <Link to="/educator/my-courses">Manage all courses →</Link>
            </div>
          )}
        </div>

        <aside className="studio-side-column">
          <div className="studio-panel studio-actions-panel">
            <div className="studio-panel-heading">
              <div>
                <span className="studio-kicker">QUICK ACCESS</span>
                <h2>Let's get to work</h2>
              </div>
            </div>

            <Link to="/educator/add-course" className="studio-action-item">
              <span className="studio-action-icon action-purple">＋</span>
              <span>
                <strong>Create a course</strong>
                <small>Share something you know</small>
              </span>
              <span className="studio-action-arrow">→</span>
            </Link>

            <Link to="/educator/my-courses" className="studio-action-item">
              <span className="studio-action-icon action-blue">▤</span>
              <span>
                <strong>Manage courses</strong>
                <small>Edit, publish or update</small>
              </span>
              <span className="studio-action-arrow">→</span>
            </Link>

            <Link
              to="/educator/student-enrolled"
              className="studio-action-item"
            >
              <span className="studio-action-icon action-green">♧</span>
              <span>
                <strong>Student enrollments</strong>
                <small>View your learners</small>
              </span>
              <span className="studio-action-arrow">→</span>
            </Link>
          </div>

          <div className="studio-progress-panel">
            <div className="studio-progress-decoration">✧</div>
            <span className="studio-kicker">YOUR PUBLISHING STATUS</span>
            <h3>Every course begins with a first step.</h3>
            <p>
              {courses.length === 0
                ? 'Create your first course and start building your learning library.'
                : `${publishedCourses} published and ${draftCourses} in draft. Keep refining your learning content.`}
            </p>

            <div className="studio-publish-track">
              <div
                style={{
                  width: courses.length
                    ? `${(publishedCourses / courses.length) * 100}%`
                    : '0%',
                }}
              />
            </div>

            <div className="studio-publish-caption">
              <span>Published</span>
              <strong>
                {courses.length
                  ? Math.round((publishedCourses / courses.length) * 100)
                  : 0}%
              </strong>
            </div>
          </div>
        </aside>
      </section>

      <footer className="studio-footer">
        <span className="studio-footer-mark">N</span>
        <p>
          <strong>Nexora Studio</strong> · Keep creating. Keep inspiring.
        </p>
        <span className="studio-footer-sparkle">✦</span>
      </footer>
    </main>
  );
};

export default Dashboard;
