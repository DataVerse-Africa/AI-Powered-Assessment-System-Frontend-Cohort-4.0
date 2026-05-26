// src/pages/Login.jsx
// POST /api/auth/login
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Stethoscope, Eye, EyeOff, LogIn } from 'lucide-react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm]     = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  // Redirect to where they were trying to go, or dashboard
  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Email and password are required.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', form);
      login(res.data);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail;
      if (err.response?.status === 403) {
        setError('Your account has been suspended. Contact the administrator.');
      } else {
        setError(typeof msg === 'string' ? msg : 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-logo">
          <div className="auth-logo-icon"><Stethoscope size={22} /></div>
          <div>
            <div className="auth-logo-text">DataVerse Africa Cohort 4.0 Patient Assess System</div>
            <div className="auth-logo-sub">Clinical Decision Support</div>
          </div>
        </div>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-subtitle">Sign in to your clinician account to continue.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="you@clinic.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                type={showPw ? 'text' : 'password'}
                name="password"
                placeholder="Your password"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
                style={{ paddingRight: 40 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer',
                }}
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-full btn-lg"
            disabled={loading}
            style={{ marginTop: 4 }}
          >
            {loading ? <><span className="spinner" /> Signing in…</> : <><LogIn size={16} /> Sign In</>}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Link
            to="/admin-login"
            style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}
          >
            Admin login →
          </Link>
        </div>
      </div>
    </div>
  );
}
