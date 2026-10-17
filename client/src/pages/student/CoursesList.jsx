
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { fetchPublishedCourses } from '../../services/courseApi';

const categories = [
  'All',
  'Development',
  'Design',
  'Data Science',
  'Marketing',
  'Business',
  'Personal Development',
];

export default function CoursesList() {
  const { input = '' } = useParams();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState(input);
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('featured');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setSearch(input);
  }, [input]);

  useEffect(() => {
    let cancelled = false;

    async function loadCourses() {
      try {
        setLoading(true);
        setError('');

        const result = await fetchPublishedCourses();

        if (!cancelled) {
          setCourses(Array.isArray(result) ? result : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Unable to load courses.');
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

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    let result = courses.filter((course) => {
      const searchableText = [
        course.title,
        course.description,
        course.category,
        course.level,
        course.language,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);

      const matchesCategory =
        category === 'All' ||
        (course.category || '').toLowerCase() === category.toLowerCase();

      return matchesSearch && matchesCategory;
    });

    if (sort === 'price-low') {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sort === 'price-high') {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sort === 'title') {
      result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    }

    return result;
  }, [courses, search, category, sort]);

  const handleSearch = (event) => {
    event.preventDefault();

    const query = search.trim();

    navigate(
      query
        ? `/course-list/${encodeURIComponent(query)}`
        : '/courses'
    );
  };

  return (
    <main className="catalog-page">
      <section className="catalog-hero">
        <div className="catalog-hero-inner">
          <span className="catalog-eyebrow">
            <span /> THE NEXORA LEARNING LIBRARY
          </span>

          <h1>
            Find your next
            <br />
            <span>big thing.</span>
          </h1>

          <p>
            Explore courses designed to help you build real skills,
            discover new interests, and grow at your own pace.
          </p>

          <form className="catalog-search" onSubmit={handleSearch}>
            <span aria-hidden="true">⌕</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search courses, skills, or topics..."
              aria-label="Search courses"
            />
            <button type="submit">Search ↗</button>
          </form>

          <div className="catalog-hero-note">
            <span>✦</span> Your next skill starts with one course.
          </div>
        </div>
        <div className="catalog-hero-orb" aria-hidden="true">n.</div>
      </section>

      <section className="catalog-content">
        <div className="catalog-heading">
          <div>
            <span className="catalog-section-label">EXPLORE & DISCOVER</span>
            <h2>All courses</h2>
            <p>Find the right course for your next chapter.</p>
          </div>

          <div className="catalog-count">
            <strong>{filteredCourses.length}</strong>
            <span>
              {filteredCourses.length === 1 ? 'course' : 'courses'} found
            </span>
          </div>
        </div>

        <div className="catalog-toolbar">
          <div className="catalog-filters" aria-label="Filter by category">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                className={`catalog-filter ${category === item ? 'active' : ''}`}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <label className="catalog-sort">
            <span>Sort by</span>
            <select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to high</option>
              <option value="price-high">Price: High to low</option>
              <option value="title">Course name</option>
            </select>
          </label>
        </div>

        {loading ? (
          <div className="catalog-state">
            <div className="catalog-spinner" />
            <h3>Finding great courses...</h3>
            <p>Your learning library is loading.</p>
          </div>
        ) : error ? (
          <div className="catalog-state">
            <span className="catalog-state-icon">!</span>
            <h3>We couldn't load the courses.</h3>
            <p>{error}</p>
            <button
              type="button"
              className="catalog-primary-button"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="catalog-state">
            <span className="catalog-state-icon">⌕</span>
            <h3>No matching courses yet</h3>
            <p>Try another search term or select a different category.</p>
            <button
              type="button"
              className="catalog-primary-button"
              onClick={() => {
                setSearch('');
                setCategory('All');
                navigate('/courses');
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="catalog-grid">
            {filteredCourses.map((course, index) => (
              <article className="catalog-card" key={course._id}>
                <Link
                  className={`catalog-card-image catalog-image-${index % 4}`}
                  to={`/course/${course._id}`}
                  aria-label={`View ${course.title}`}
                >
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt="" />
                  ) : (
                    <div className="catalog-placeholder">
                      <span>{['✳', '⌘', '✦', '◈'][index % 4]}</span>
                      <small>NEXORA LEARNING</small>
                    </div>
                  )}

                  <span className="catalog-level">
                    {course.level || 'All levels'}
                  </span>
                </Link>

                <div className="catalog-card-body">
                  <div className="catalog-card-meta">
                    <span>{course.category || 'General'}</span>
                    <span>{course.language || 'English'}</span>
                  </div>

                  <h3>
                    <Link to={`/course/${course._id}`}>
                      {course.title}
                    </Link>
                  </h3>

                  <p className="catalog-description">
                    {course.description ||
                      'Explore this course and start building new skills.'}
                  </p>

                  <div className="catalog-card-bottom">
                    <div className="catalog-price">
                      {Number(course.price) <= 0
                        ? 'Free'
                        : `₹${Number(course.price).toLocaleString('en-IN')}`}
                    </div>

                    <Link
                      className="catalog-view-link"
                      to={`/course/${course._id}`}
                    >
                      View course <span>↗</span>
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="catalog-bottom-cta">
        <div>
          <span>KEEP YOUR CURIOSITY ALIVE</span>
          <h2>Every expert was once a beginner.</h2>
          <p>Choose a course. Start learning. Keep growing.</p>
        </div>
        <Link to="/">Back to home ↗</Link>
      </section>
    </main>
  );
}
