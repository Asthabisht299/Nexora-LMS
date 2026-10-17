
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchPublishedCourses } from '../../services/courseApi';

const categories = [
  { name: 'Development', icon: '⌘', color: '#e9e5ff' },
  { name: 'Design', icon: '✳', color: '#ffe9dc' },
  { name: 'Data Science', icon: '⌁', color: '#dff5e7' },
  { name: 'Marketing', icon: '↗', color: '#fff0c9' },
];

const Home = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      try {
        const data = await fetchPublishedCourses();
        if (!cancelled) setCourses(data || []);
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to load courses right now.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadCourses();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    navigate(
      query
        ? `/course-list/${encodeURIComponent(query)}`
        : '/courses'
    );
  };

  const featuredCourses = courses.slice(0, 3);

  return (
    <main className="nexora-home">
      <section className="home-hero">
        <div className="home-hero-content">
          <span className="home-eyebrow">
            <span className="home-eyebrow-dot" />
            YOUR NEXT CHAPTER STARTS HERE
          </span>

          <h1>
            Learn something
            <br />
            <span>extraordinary.</span>
          </h1>

          <p>
            Discover expert-led courses, build practical skills,
            and turn your curiosity into your next big achievement.
          </p>

          <form className="home-search" onSubmit={handleSearch}>
            <span aria-hidden="true">⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="What do you want to learn?"
              aria-label="Search courses"
            />
            <button type="submit">Explore courses ↗</button>
          </form>

          <div className="home-trust-row">
            <span><strong>Learn</strong> at your own pace</span>
            <span><strong>Explore</strong> new possibilities</span>
          </div>
        </div>

        <div className="home-hero-art" aria-label="Learning illustration">
          <div className="hero-orbit hero-orbit-one" />
          <div className="hero-orbit hero-orbit-two" />

          <div className="hero-art-main">
            <div className="hero-art-window">
              <div className="hero-window-top">
                <span />
                <span />
                <span />
              </div>
              <div className="hero-code-line short" />
              <div className="hero-code-line long" />
              <div className="hero-code-line medium" />
              <div className="hero-code-line long second" />
              <div className="hero-code-line short second" />
              <div className="hero-art-bottom">
                <span>✦</span>
                <div>
                  <strong>Keep growing.</strong>
                  <small>One lesson at a time.</small>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-floating-card hero-floating-top">
            <span className="hero-float-icon">✳</span>
            <div><strong>New skills</strong><small>New opportunities</small></div>
          </div>

          <div className="hero-floating-card hero-floating-bottom">
            <span className="hero-float-check">✓</span>
            <div><strong>Your journey</strong><small>Starts with one step</small></div>
          </div>
        </div>

        <div className="home-hero-decoration">N.</div>
      </section>

      <section className="home-section home-categories">
        <div className="home-section-heading">
          <div>
            <span className="home-section-label">FIND YOUR DIRECTION</span>
            <h2>Explore by category</h2>
            <p>Choose a field and discover what you can achieve.</p>
          </div>
          <Link to="/courses">All courses <span>↗</span></Link>
        </div>

        <div className="home-category-grid">
          {categories.map((category) => (
            <button
              className="home-category-card"
              key={category.name}
              onClick={() =>
                navigate(`/course-list/${encodeURIComponent(category.name)}`)
              }
            >
              <span
                className="home-category-icon"
                style={{ backgroundColor: category.color }}
              >
                {category.icon}
              </span>
              <span className="home-category-name">{category.name}</span>
              <span className="home-category-arrow">↗</span>
            </button>
          ))}
        </div>
      </section>

      <section className="home-section home-featured">
        <div className="home-section-heading">
          <div>
            <span className="home-section-label">CURATED FOR YOUR GROWTH</span>
            <h2>Courses worth exploring.</h2>
            <p>Find your next skill among our published courses.</p>
          </div>
          <Link to="/courses">Browse all <span>↗</span></Link>
        </div>

        {loading ? (
          <div className="home-feedback">Discovering courses for you...</div>
        ) : error ? (
          <div className="home-feedback">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Try again
            </button>
          </div>
        ) : featuredCourses.length === 0 ? (
          <div className="home-feedback">
            <h3>Your next favourite course is on its way.</h3>
            <p>Published courses will appear here when educators add them.</p>
            <Link to="/courses">Explore courses ↗</Link>
          </div>
        ) : (
          <div className="home-course-grid">
            {featuredCourses.map((course, index) => (
              <article className="home-course-card" key={course._id}>
                <Link
                  to={`/course/${course._id}`}
                  className={`home-course-visual visual-${index % 3}`}
                  aria-label={`View ${course.title}`}
                >
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt="" />
                  ) : (
                    <div className="home-course-placeholder">
                      <span>{['✳', '⌘', '✦'][index % 3]}</span>
                      <small>NEXORA LEARNING</small>
                    </div>
                  )}
                  <span className="home-course-level">
                    {course.level || 'All levels'}
                  </span>
                </Link>

                <div className="home-course-body">
                  <span className="home-course-category">
                    {course.category || 'Learning'}
                  </span>
                  <h3>
                    <Link to={`/course/${course._id}`}>
                      {course.title}
                    </Link>
                  </h3>
                  <p className="home-course-description">
                    {course.description || 'Explore new skills and expand your knowledge.'}
                  </p>

                  <div className="home-course-footer">
                    <strong>
                      {Number(course.price) <= 0
                        ? 'Free'
                        : `₹${Number(course.price).toLocaleString('en-IN')}`}
                    </strong>
                    <Link to={`/course/${course._id}`}>
                      View course ↗
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="home-cta">
        <div>
          <span>YOUR FUTURE IS A WORK IN PROGRESS</span>
          <h2>Small steps. Big possibilities.</h2>
          <p>Start learning today and keep moving toward your goals.</p>
        </div>
        <Link to="/courses">Start exploring ↗</Link>
      </section>

      <footer className="nexora-footer">
        <Link to="/" className="footer-brand">
          <span>n</span> nexora<span className="footer-dot">.</span>
        </Link>
        <p>Learn without limits. Grow without boundaries.</p>
        <span>© {new Date().getFullYear()} Nexora LMS</span>
      </footer>
    </main>
  );
};

export default Home;
