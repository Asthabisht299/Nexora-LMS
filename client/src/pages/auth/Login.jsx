
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/authService';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedRole, setSelectedRole] = useState('student');
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.email.trim() || !form.password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);

      const result = await loginUser({
        email: form.email.trim(),
        password: form.password,
      });

      // Always trust the role returned by the backend, not the selector.
      if (result.user.role !== selectedRole) {
        setError(
          `This account is registered as a ${result.user.role}. Please select ${
            result.user.role === 'educator' ? 'Educator' : 'Student'
          } and try again.`
        );
        return;
      }

      // Save the authenticated session only after the role matches.
      localStorage.setItem('nexora_token', result.token);
      localStorage.setItem('nexora_user', JSON.stringify(result.user));

      // Send the user to their appropriate dashboard.
      if (result.user.role === 'educator') {
        navigate('/educator', { replace: true });
      } else {
        const requestedPath = location.state?.from?.pathname;

        // Do not redirect a student into educator-only pages.
        if (requestedPath?.startsWith('/educator')) {
          navigate('/', { replace: true });
        } else {
          navigate(requestedPath || '/', { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-card">
        <div className="auth-heading">
          <div className="auth-logo">N</div>
          <h1>Welcome to Nexora</h1>
          <p>Sign in to continue your learning journey.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <label className="auth-label">Continue as</label>

          <div className="role-selector">
            <button
              type="button"
              className={`role-option ${
                selectedRole === 'student' ? 'selected' : ''
              }`}
              onClick={() => {
                setSelectedRole('student');
                setError('');
              }}
              aria-pressed={selectedRole === 'student'}
            >
              <span className="role-icon">📚</span>
              <span className="role-title">Student</span>
              <span className="role-description">Learn courses</span>
            </button>

            <button
              type="button"
              className={`role-option ${
                selectedRole === 'educator' ? 'selected' : ''
              }`}
              onClick={() => {
                setSelectedRole('educator');
                setError('');
              }}
              aria-pressed={selectedRole === 'educator'}
            >
              <span className="role-icon">🎓</span>
              <span className="role-title">Educator</span>
              <span className="role-description">Create courses</span>
            </button>
          </div>

          <div className="auth-field">
            <label htmlFor="email" className="auth-label">
              Email address
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password" className="auth-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="auth-error" role="alert">
              {error}
            </div>
          )}

          <button
            className="auth-submit"
            type="submit"
            disabled={loading}
          >
            {loading
              ? 'Signing in...'
              : `Sign in as ${
                  selectedRole === 'educator' ? 'Educator' : 'Student'
                }`}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create account</Link>
        </p>

        <p className="auth-note">
          Educator access is available only to accounts authorized as educators.
        </p>
      </section>
    </main>
  );
};

export default Login;
