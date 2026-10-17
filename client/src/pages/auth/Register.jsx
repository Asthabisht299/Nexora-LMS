
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../../services/authService';

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      const result = await registerUser({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      localStorage.setItem('nexora_token', result.token);
      localStorage.setItem('nexora_user', JSON.stringify(result.user));

      setSuccess('Account created successfully!');

      setTimeout(() => navigate('/'), 800);
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <Link to="/" style={styles.brand}>
          Nexora<span style={{ color: '#8b5cf6' }}> LMS</span>
        </Link>

        <h1 style={styles.heading}>Create your account</h1>
        <p style={styles.subtitle}>
          Start your learning journey with Nexora.
        </p>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Full name</label>
          <input
            style={styles.input}
            name="name"
            type="text"
            placeholder="Enter your full name"
            value={form.name}
            onChange={handleChange}
            required
            autoComplete="name"
          />

          <label style={styles.label}>Email address</label>
          <input
            style={styles.input}
            name="email"
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />

          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            name="password"
            type="password"
            placeholder="At least 8 characters"
            value={form.password}
            onChange={handleChange}
            required
            minLength={8}
            autoComplete="new-password"
          />

          <label style={styles.label}>Confirm password</label>
          <input
            style={styles.input}
            name="confirmPassword"
            type="password"
            placeholder="Enter your password again"
            value={form.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
          />

          {error && <p style={styles.error}>{error}</p>}
          {success && <p style={styles.success}>{success}</p>}

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Log in</Link>
        </p>

        <p style={styles.note}>
          Student registration is open. Educator accounts will be set up
          separately for security.
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 16px',
    background: 'linear-gradient(135deg, #0f172a, #1e1b4b, #312e81)',
    fontFamily: 'Arial, sans-serif',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
    boxSizing: 'border-box',
    padding: '36px',
    borderRadius: '20px',
    background: '#ffffff',
    boxShadow: '0 25px 70px rgba(0,0,0,0.25)',
  },
  brand: {
    display: 'block',
    textAlign: 'center',
    fontSize: '27px',
    fontWeight: '800',
    color: '#111827',
    textDecoration: 'none',
    marginBottom: '24px',
  },
  heading: {
    margin: '0 0 8px',
    textAlign: 'center',
    fontSize: '27px',
    color: '#111827',
  },
  subtitle: {
    margin: '0 0 26px',
    textAlign: 'center',
    color: '#64748b',
    fontSize: '14px',
  },
  label: {
    display: 'block',
    marginBottom: '7px',
    marginTop: '16px',
    color: '#334155',
    fontSize: '14px',
    fontWeight: '600',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 13px',
    border: '1px solid #cbd5e1',
    borderRadius: '9px',
    fontSize: '14px',
    outlineColor: '#8b5cf6',
  },
  button: {
    width: '100%',
    marginTop: '24px',
    padding: '13px',
    border: 'none',
    borderRadius: '9px',
    background: 'linear-gradient(90deg, #7c3aed, #4f46e5)',
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
  },
  error: {
    color: '#dc2626',
    fontSize: '13px',
    marginBottom: '0',
  },
  success: {
    color: '#15803d',
    fontSize: '13px',
    marginBottom: '0',
  },
  footer: {
    textAlign: 'center',
    color: '#64748b',
    fontSize: '14px',
    marginTop: '22px',
  },
  link: {
    color: '#6d28d9',
    fontWeight: '700',
    textDecoration: 'none',
  },
  note: {
    marginTop: '20px',
    color: '#64748b',
    fontSize: '12px',
    lineHeight: '1.6',
    textAlign: 'center',
  },
};

export default Register;
