// src/pages/admin/AdminLogin.jsx
// POST /api/auth/admin-login
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff, LogIn } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();

  const [form, setForm]     = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Email and password are required.'); return; }
    setLoading(true);
    try {
      const res = await api.post('/api/auth/admin-login', form);
      adminLogin(res.data);
      navigate('/admin/dashboard', { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail;
      setError(typeof msg === 'string' ? msg : 'Invalid admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #4c1d95 100%)',
    }}>
      <div className="auth-card">

        <div className="auth-logo">
          <div className="auth-logo-icon" style={{ background: '#7c3aed' }}>
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="auth-logo-text">Admin Panel</div>
            <div className="auth-logo-sub">DataVerse Africa Cohort 4.0 Patient Assess System</div>
          </div>
        </div>

        <h1 className="auth-title">Administrator Login</h1>
        <p className="auth-subtitle">
          Restricted access. Use credentials from your <code style={{
            background: 'var(--surface-2)', padding: '1px 5px',
            borderRadius: 4, fontSize: '0.8em',
          }}>.env</code> file.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Admin Email</label>
            <input
              className="form-input"
              type="email"
              name="email"
              placeholder="admin@clinic.com"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Admin Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                type={showPw ? 'text' : 'password'}
                name="password"
                placeholder="Admin password"
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
            className="btn btn-full btn-lg"
            disabled={loading}
            style={{
              marginTop: 4,
              background: '#7c3aed',
              color: 'white',
              border: '1px solid #7c3aed',
              borderRadius: 'var(--radius)',
            }}
          >
            {loading ? <><span className="spinner" /> Authenticating…</> : <><LogIn size={16} /> Sign In as Admin</>}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: 'center' }}>
          <a href="/login" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            ← Back to clinician login
          </a>
        </div>
      </div>
    </div>
  );
}
