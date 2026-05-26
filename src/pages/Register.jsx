// src/pages/Register.jsx
// POST /api/auth/register
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Stethoscope, Eye, EyeOff, UserPlus } from 'lucide-react';
import api from '../api/axios';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.full_name || !form.email || !form.password) {
      setError('All fields are required.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/auth/register', form);
      setSuccess('Account created! Redirecting to login…');
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      const msg = err.response?.data?.detail;
      setError(typeof msg === 'string' ? msg : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon"><Stethoscope size={22} /></div>
          <div>
            <div className="auth-logo-text">PatientAssess</div>
            <div className="auth-logo-sub">Clinical Decision Support</div>
          </div>
        </div>

        <h1 className="auth-title">Create an account</h1>
        <p className="auth-subtitle">Register to access the clinical assessment system.</p>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name <span className="required">*</span></label>
            <input
              className="form-input"
              name="full_name"
              placeholder="Dr. Jane Smith"
              value={form.full_name}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address <span className="required">*</span></label>
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="you@clinic.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password <span className="required">*</span></label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                type={showPw ? 'text' : 'password'}
                name="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
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
            {loading ? <><span className="spinner" /> Creating account…</> : <><UserPlus size={16} /> Create Account</>}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
