// src/pages/NewSession.jsx
// POST /api/sessions/
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Save } from 'lucide-react';
import api from '../api/axios';

export default function NewSession() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    patient_name: '',
    patient_age: '',
    patient_gender: '',
    reason_for_visit: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    if (!form.patient_name || !form.patient_age || !form.patient_gender || !form.reason_for_visit) {
      setError('Patient name, age, gender, and reason for visit are required.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        patient_age: parseInt(form.patient_age, 10),
      };
      const res = await api.post('/api/sessions/', payload);
      const sessionId = res.data.session_id || res.data.id;
      navigate(`/sessions/${sessionId}`);
    } catch (err) {
      const msg = err.response?.data?.detail;
      setError(typeof msg === 'string' ? msg : 'Failed to create session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>New Patient Session</h1>
        <p>Fill in the patient details to open a new clinical session.</p>
      </div>

      <div className="card" style={{ maxWidth: 680 }}>
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Patient Info */}
          <div className="form-section">
            <div className="form-section-title">
              <UserPlus size={15} style={{ display: 'inline', marginRight: 6 }} />
              Patient Information
            </div>

            <div className="form-row cols-2" style={{ marginBottom: 14 }}>
              <div className="form-group">
                <label className="form-label">Patient Name <span className="required">*</span></label>
                <input
                  className="form-input"
                  name="patient_name"
                  placeholder="Full name"
                  value={form.patient_name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Age <span className="required">*</span></label>
                <input
                  className="form-input"
                  type="number"
                  name="patient_age"
                  placeholder="e.g. 45"
                  min="0"
                  max="130"
                  value={form.patient_age}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label">Gender <span className="required">*</span></label>
              <select
                className="form-select"
                name="patient_gender"
                value={form.patient_gender}
                onChange={handleChange}
              >
                <option value="">Select gender…</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Visit Info */}
          <div className="form-section">
            <div className="form-section-title">Visit Details</div>

            <div className="form-group" style={{ marginBottom: 14 }}>
              <label className="form-label">Reason for Visit <span className="required">*</span></label>
              <input
                className="form-input"
                name="reason_for_visit"
                placeholder="e.g. Follow-up on diabetes screening"
                value={form.reason_for_visit}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Additional Notes</label>
              <textarea
                className="form-textarea"
                name="notes"
                placeholder="Any additional clinical notes (optional)…"
                value={form.notes}
                onChange={handleChange}
                rows={4}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/sessions')}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading
                ? <><span className="spinner" /> Opening session…</>
                : <><Save size={15} /> Open Session</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
