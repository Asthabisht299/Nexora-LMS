
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api';

const MyEnrollments = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEnrollments = async () => {
      try {
        setLoading(true);
        setError('');

        const token = localStorage.getItem('nexora_token');

        if (!token) {
          setError('Please log in as a student to view your enrollments.');
          return;
        }

        const response = await fetch(`${API_URL}/enrollments/mine`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.message || 'Unable to load enrollments.');
        }

        setEnrollments(
          Array.isArray(data.enrollments) ? data.enrollments : []
        );
      } catch (err) {
        setError(err.message || 'Something went wrong.');
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, []);

  if (loading) {
    return (
      <main className="my-enrollments-page">
        <div className="enrollments-container">
          <p>Loading your courses...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="my-enrollments-page">
        <div className="enrollments-container">
          <h2>Unable to load your courses</h2>
          <p>{error}</p>
          <Link to="/course-list">Browse courses</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="my-enrollments-page">
      <div className="enrollments-container">
        <header className="enrollments-header">
          <div>
            <p className="enrollments-eyebrow">YOUR LEARNING SPACE</p>
            <h1>My Enrollments</h1>
            <p>Continue learning and track the courses you've joined.</p>
          </div>

          <Link to="/course-list" className="enrollments-browse-button">
            Explore courses ↗
          </Link>
        </header>

        <div className="enrollments-summary">
          <div>
            <span>Total courses</span>
            <strong>{enrollments.length}</strong>
          </div>
          <div>
            <span>Active</span>
            <strong>
              {enrollments.filter(
                (item) => item.enrollmentStatus === 'active'
              ).length}
            </strong>
          </div>
          <div>
            <span>Pending payment</span>
            <strong>
              {enrollments.filter(
                (item) =>
                  item.paymentStatus === 'pending' ||
                  item.enrollmentStatus === 'pending'
              ).length}
            </strong>
          </div>
        </div>

        {enrollments.length === 0 ? (
          <section className="enrollments-empty">
            <div className="enrollments-empty-icon">📚</div>
            <h2>Your learning journey starts here</h2>
            <p>
              You haven't enrolled in any courses yet. Explore the catalog
              and find something you want to learn.
            </p>
            <Link to="/course-list" className="enrollments-browse-button">
              Browse courses
            </Link>
          </section>
        ) : (
          <section className="enrollments-grid">
            {enrollments.map((item) => {
              const course = item.course;
              const isActive = item.enrollmentStatus === 'active';
              const isPending =
                item.paymentStatus === 'pending' ||
                item.enrollmentStatus === 'pending';

              if (!course) {
                return (
                  <article className="enrollment-card" key={item._id}>
                    <h3>Course unavailable</h3>
                    <p>This course may have been removed.</p>
                  </article>
                );
              }

              return (
                <article className="enrollment-card" key={item._id}>
                  <div className="enrollment-card-image">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={course.title} />
                    ) : (
                      <div className="enrollment-image-placeholder">
                        📘
                      </div>
                    )}

                    <span
                      className={`enrollment-status ${
                        isActive
                          ? 'status-active'
                          : isPending
                            ? 'status-pending'
                            : 'status-inactive'
                      }`}
                    >
                      {isActive
                        ? 'Enrolled'
                        : isPending
                          ? 'Payment pending'
                          : item.enrollmentStatus || 'Inactive'}
                    </span>
                  </div>

                  <div className="enrollment-card-content">
                    <p className="enrollment-category">
                      {course.category || 'General'}
                    </p>

                    <h2>{course.title}</h2>

                    <p className="enrollment-description">
                      {course.description || 'Continue your learning journey.'}
                    </p>

                    <div className="enrollment-meta">
                      <span>{course.level || 'All levels'}</span>
                      <span>
                        {Number(course.price) > 0
                          ? `₹${course.price}`
                          : 'Free'}
                      </span>
                    </div>

                    {isActive ? (
                      <Link
                        to={`/player/${course._id}`}
                        className="enrollment-action"
                      >
                        Continue learning →
                      </Link>
                    ) : isPending ? (
                      <Link
                        to={`/course/${course._id}`}
                        className="enrollment-action enrollment-action-secondary"
                      >
                        View course / payment →
                      </Link>
                    ) : (
                      <Link
                        to={`/course/${course._id}`}
                        className="enrollment-action"
                      >
                        View course →
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
};

export default MyEnrollments;
