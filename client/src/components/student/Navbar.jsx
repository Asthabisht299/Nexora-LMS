
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [authVersion, setAuthVersion] = useState(0);

  const getUser = () => {
    try {
      return JSON.parse(localStorage.getItem('nexora_user') || 'null');
    } catch {
      return null;
    }
  };

  const user = getUser();
  const isLoggedIn =
    Boolean(localStorage.getItem('nexora_token')) && Boolean(user);

  const isActive = (path) =>
    location.pathname === path ? 'nav-link active' : 'nav-link';

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    localStorage.removeItem('nexora_token');
    localStorage.removeItem('nexora_user');

    setAuthVersion((version) => version + 1);
    closeMenu();
    navigate('/login');
  };

  // Re-render when the login state changes within this component.
  void authVersion;

  const initial = user?.name?.trim()?.charAt(0)?.toUpperCase() || 'U';

  return (
    <header className="site-header">
      <div className="nav-inner">
        <Link
          to="/"
          className="brand"
          aria-label="Nexora home"
          onClick={closeMenu}
        >
          <span className="brand-mark">
            <span>n</span>
          </span>

          <span className="brand-name">
            nexora<span className="brand-dot">.</span>
            <small>LEARN WITHOUT LIMITS</small>
          </span>
        </Link>

        <button
          className="mobile-menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
        >
          {menuOpen ? '✕' : '☰'}
        </button>

        <nav className={`nav-links ${menuOpen ? 'nav-open' : ''}`}>
          <Link
            className={isActive('/')}
            to="/"
            onClick={closeMenu}
          >
            Discover
          </Link>

          <Link
            className={
              location.pathname.startsWith('/course')
                ? 'nav-link active'
                : 'nav-link'
            }
            to="/course-list"
            onClick={closeMenu}
          >
            Explore courses
          </Link>

          <Link
            className={isActive('/my-enrollments')}
            to="/my-enrollments"
            onClick={closeMenu}
          >
            My learning
          </Link>
        </nav>

        <div className="nav-actions">
          {isLoggedIn ? (
            <>
              {user.role === 'educator' ? (
                <Link
                  to="/educator"
                  className="teach-link"
                  onClick={closeMenu}
                >
                  Educator dashboard <span>↗</span>
                </Link>
              ) : (
                <span className="welcome-user">
                  Hi, {user.name?.split(' ')[0] || 'Learner'}
                </span>
              )}

              <button
                className="avatar-button"
                aria-label={`Log out ${user.name || 'user'}`}
                title="Log out"
                onClick={handleLogout}
              >
                {initial}
              </button>

              <button
                className="logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="teach-link"
                onClick={closeMenu}
              >
                Login
              </Link>

              <Link
                to="/register"
                className="register-button"
                onClick={closeMenu}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
