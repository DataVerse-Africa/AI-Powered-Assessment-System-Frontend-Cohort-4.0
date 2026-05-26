// src/pages/RunPrediction.jsx
// Endpoints:
//   POST /api/predict/diabetes
//   POST /api/predict/ckd
//   POST /api/predict/pneumonia
//   POST /api/predict/breast-cancer
//   GET  /api/predict/status
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Activity, Upload, ChevronDown, ChevronUp, AlertTriangle, CheckCircle } from 'lucide-react';
import api from '../api/axios';

/* ── Helpers ──────────────────────────────────────────────────────── */
function riskBadge(level) {
  const map = { Low: 'badge-low', Moderate: 'badge-moderate', High: 'badge-high', Critical: 'badge-critical' };
  return <span className={`badge ${map[level] || ''}`}>{level || '—'}</span>;
}

function Field({ label, name, type = 'number', value, onChange, hint, min, max, step, options }) {
  return (
    <div className="form-group">
      <label className="form-label">{label} <span className="required">*</span></label>
      {options ? (
        <select className="form-select" name={name} value={value} onChange={onChange}>
          <option value="">Select…</option>
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      ) : (
        <input
          className="form-input"
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step || (type === 'number' ? '0.01' : undefined)}
        />
      )}
      {hint && <span className="form-hint">{hint}</span>}
    </div>
  );
}

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="accordion">
      <div className="accordion-header" onClick={() => setOpen(o => !o)}>
        <span>{title}</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </div>
      {open && <div className="accordion-body">{children}</div>}
    </div>
  );
}

/* ── Diabetes Form ────────────────────────────────────────────────── */
const DIABETES_DEFAULTS = {
  Pregnancies: '', Glucose: '', BloodPressure: '', SkinThickness: '',
  Insulin: '', BMI: '', DiabetesPedigreeFunction: '', Age: '',
};

function DiabetesForm({ sessionId, onResult }) {
  const [form, setForm] = useState(DIABETES_DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Raw inputs
      const Glucose     = parseFloat(form.Glucose);
      const BMI         = parseFloat(form.BMI);
      const Insulin     = parseFloat(form.Insulin);
      const Age         = parseInt(form.Age);
      const Pregnancies = parseInt(form.Pregnancies);

      // Engineered features — calculated exactly as the model was trained
      const Glucose_BMI           = Glucose * BMI;
      const Insulin_Glucose_Ratio = Glucose > 0 ? Insulin / Glucose : 0;
      const Age_Pregnancies       = Age * Pregnancies;
      const Age_Group             = Age < 30 ? 0 : Age < 40 ? 1 : Age < 50 ? 2 : Age < 60 ? 3 : 4;
      const BMI_Category          = BMI < 18.5 ? 0 : BMI < 25 ? 1 : BMI < 30 ? 2 : 3;

      const payload = {
        session_id:               parseInt(sessionId),
        Pregnancies,
        Glucose,
        BloodPressure:            parseFloat(form.BloodPressure),
        SkinThickness:            parseFloat(form.SkinThickness),
        Insulin,
        BMI,
        DiabetesPedigreeFunction: parseFloat(form.DiabetesPedigreeFunction),
        Age,
        Glucose_BMI,
        Insulin_Glucose_Ratio,
        Age_Pregnancies,
        Age_Group,
        BMI_Category,
      };
      const res = await api.post('/api/predict/diabetes', payload);
      onResult(res.data);
      setForm(DIABETES_DEFAULTS);
    } catch (err) {
      setError(err.response?.data?.detail?.toString() || 'Prediction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      {error && <div className="alert alert-error">{error}</div>}
      <div className="form-row cols-2" style={{ marginBottom: 14 }}>
        <Field label="Pregnancies" name="Pregnancies" type="number" value={form.Pregnancies} onChange={handle} min={0} max={20} hint="Number of pregnancies" step="1" />
        <Field label="Glucose (mg/dL)" name="Glucose" value={form.Glucose} onChange={handle} min={0} max={300} hint="Plasma glucose concentration" />
      </div>
      <div className="form-row cols-2" style={{ marginBottom: 14 }}>
        <Field label="Blood Pressure (mm/Hg)" name="BloodPressure" value={form.BloodPressure} onChange={handle} min={0} max={200} />
        <Field label="Skin Thickness (mm)" name="SkinThickness" value={form.SkinThickness} onChange={handle} min={0} max={100} />
      </div>
      <div className="form-row cols-2" style={{ marginBottom: 14 }}>
        <Field label="Insulin (mu U/ml)" name="Insulin" value={form.Insulin} onChange={handle} min={0} max={900} />
        <Field label="BMI" name="BMI" value={form.BMI} onChange={handle} min={0} max={100} hint="kg/m²" />
      </div>
      <div className="form-row cols-2" style={{ marginBottom: 20 }}>
        <Field label="Diabetes Pedigree Function" name="DiabetesPedigreeFunction" value={form.DiabetesPedigreeFunction} onChange={handle} min={0} max={3} hint="Genetic risk score (0–3)" />
        <Field label="Age (years)" name="Age" type="number" value={form.Age} onChange={handle} min={1} max={120} step="1" />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? <><span className="spinner" /> Running…</> : <><Activity size={15} /> Run Diabetes Prediction</>}
      </button>
    </form>
  );
}

/* ── CKD Form ─────────────────────────────────────────────────────── */
const YN = [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }];

const CKD_DEFAULTS = {
  age: '', bp: '', sg: '', al: '', su: '', rbc: '', pc: '', pcc: '', ba: '',
  bgr: '', bu: '', sc: '', sod: '', pot: '', hemo: '', pcv: '', wc: '', rc: '',
  htn: '', dm: '', cad: '', appet: '', pe: '', ane: '',
  // engineered features (set to 0 by default — model expects them)
  age_bp_interaction: '0', glucose_urea_ratio: '0', hemoglobin_pcv_interaction: '0',
  wbc_rbc_ratio: '0', sodium_potassium_ratio: '0', albumin_sugar_product: '0',
  creatinine_urea_ratio: '0', blood_cell_ratio: '0',
  sg_normalized: '0', bp_normalized: '0', bgr_normalized: '0',
  bu_normalized: '0', sc_normalized: '0', sod_normalized: '0',
  pot_normalized: '0', hemo_normalized: '0', pcv_normalized: '0',
  wc_normalized: '0', rc_normalized: '0',
};

function CKDForm({ sessionId, onResult }) {
  const [form, setForm] = useState(CKD_DEFAULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const handle = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const toNum = v => {
    if (v === '' || v === null || v === undefined) return 0;
    const n = parseFloat(v);
    return isNaN(n) ? 0 : n;
  };

  const submit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload = {
        session_id: parseInt(sessionId),
        age: toNum(form.age), bp: toNum(form.bp), sg: toNum(form.sg),
        al: toNum(form.al), su: toNum(form.su),
        rbc: form.rbc === 'normal' ? 1 : 0,
        pc: form.pc === 'normal' ? 1 : 0,
        pcc: form.pcc === 'present' ? 1 : 0,
        ba: form.ba === 'present' ? 1 : 0,
        bgr: toNum(form.bgr), bu: toNum(form.bu), sc: toNum(form.sc),
        sod: toNum(form.sod), pot: toNum(form.pot), hemo: toNum(form.hemo),
        pcv: toNum(form.pcv), wc: toNum(form.wc), rc: toNum(form.rc),
        htn: form.htn === 'yes' ? 1 : 0, dm: form.dm === 'yes' ? 1 : 0,
        cad: form.cad === 'yes' ? 1 : 0,
        appet: form.appet === 'good' ? 1 : 0,
        pe: form.pe === 'yes' ? 1 : 0,
        ane: form.ane === 'yes' ? 1 : 0,
        // engineered features
        age_bp_interaction: toNum(form.age_bp_interaction),
        glucose_urea_ratio: toNum(form.glucose_urea_ratio),
        hemoglobin_pcv_interaction: toNum(form.hemoglobin_pcv_interaction),
        wbc_rbc_ratio: toNum(form.wbc_rbc_ratio),
        sodium_potassium_ratio: toNum(form.sodium_potassium_ratio),
        albumin_sugar_product: toNum(form.albumin_sugar_product),
        creatinine_urea_ratio: toNum(form.creatinine_urea_ratio),
        blood_cell_ratio: toNum(form.blood_cell_ratio),
        sg_normalized: toNum(form.sg_normalized),
        bp_normalized: toNum(form.bp_normalized),
        bgr_normalized: toNum(form.bgr_normalized),
        bu_normalized: toNum(form.bu_normalized),
        sc_normalized: toNum(form.sc_normalized),
        sod_normalized: toNum(form.sod_normalized),
        pot_normalized: toNum(form.pot_normalized),
        hemo_normalized: toNum(form.hemo_normalized),
        pcv_normalized: toNum(form.pcv_normalized),
        wc_normalized: toNum(form.wc_normalized),
        rc_normalized: toNum(form.rc_normalized),
      };
      const res = await api.post('/api/predict/ckd', payload);
      onResult(res.data);
    } catch (err) {
      setError(err.response?.data?.detail?.toString() || 'Prediction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      {error && <div className="alert alert-error">{error}</div>}

      <Accordion title="Basic Patient Info" defaultOpen>
        <div className="form-row cols-3">
          <Field label="Age" name="age" value={form.age} onChange={handle} min={0} max={120} hint="years" step="1" />
          <Field label="Blood Pressure (mm/Hg)" name="bp" value={form.bp} onChange={handle} min={0} max={200} />
          <Field label="Specific Gravity" name="sg" value={form.sg} onChange={handle} min={1.000} max={1.030} step="0.001" hint="1.005–1.025" />
        </div>
      </Accordion>

      <Accordion title="Urine Analysis">
        <div className="form-row cols-3">
          <Field label="Albumin (al)" name="al" value={form.al} onChange={handle} min={0} max={5} step="1" hint="0–5" />
          <Field label="Sugar (su)" name="su" value={form.su} onChange={handle} min={0} max={5} step="1" hint="0–5" />
          <Field label="Red Blood Cells" name="rbc" value={form.rbc} onChange={handle}
            options={[{ value: 'normal', label: 'Normal' }, { value: 'abnormal', label: 'Abnormal' }]} />
        </div>
        <div className="form-row cols-3" style={{ marginTop: 14 }}>
          <Field label="Pus Cell" name="pc" value={form.pc} onChange={handle}
            options={[{ value: 'normal', label: 'Normal' }, { value: 'abnormal', label: 'Abnormal' }]} />
          <Field label="Pus Cell Clumps" name="pcc" value={form.pcc} onChange={handle}
            options={[{ value: 'present', label: 'Present' }, { value: 'notpresent', label: 'Not Present' }]} />
          <Field label="Bacteria" name="ba" value={form.ba} onChange={handle}
            options={[{ value: 'present', label: 'Present' }, { value: 'notpresent', label: 'Not Present' }]} />
        </div>
      </Accordion>

      <Accordion title="Blood Chemistry">
        <div className="form-row cols-3">
          <Field label="Blood Glucose (mg/dL)" name="bgr" value={form.bgr} onChange={handle} min={0} max={500} />
          <Field label="Blood Urea (mg/dL)" name="bu" value={form.bu} onChange={handle} min={0} max={400} />
          <Field label="Serum Creatinine (mg/dL)" name="sc" value={form.sc} onChange={handle} min={0} max={20} />
        </div>
        <div className="form-row cols-3" style={{ marginTop: 14 }}>
          <Field label="Sodium (mEq/L)" name="sod" value={form.sod} onChange={handle} min={100} max={200} />
          <Field label="Potassium (mEq/L)" name="pot" value={form.pot} onChange={handle} min={2} max={10} />
          <Field label="Hemoglobin (g/dL)" name="hemo" value={form.hemo} onChange={handle} min={3} max={20} />
        </div>
        <div className="form-row cols-3" style={{ marginTop: 14 }}>
          <Field label="Packed Cell Volume (%)" name="pcv" value={form.pcv} onChange={handle} min={15} max={60} step="1" />
          <Field label="WBC Count (cells/cmm)" name="wc" value={form.wc} onChange={handle} min={2000} max={20000} step="100" />
          <Field label="RBC Count (millions)" name="rc" value={form.rc} onChange={handle} min={2} max={8} />
        </div>
      </Accordion>

      <Accordion title="Comorbidities & Symptoms">
        <div className="form-row cols-3">
          <Field label="Hypertension" name="htn" value={form.htn} onChange={handle} options={YN} />
          <Field label="Diabetes Mellitus" name="dm" value={form.dm} onChange={handle} options={YN} />
          <Field label="Coronary Artery Disease" name="cad" value={form.cad} onChange={handle} options={YN} />
        </div>
        <div className="form-row cols-3" style={{ marginTop: 14 }}>
          <Field label="Appetite" name="appet" value={form.appet} onChange={handle}
            options={[{ value: 'good', label: 'Good' }, { value: 'poor', label: 'Poor' }]} />
          <Field label="Pedal Edema" name="pe" value={form.pe} onChange={handle} options={YN} />
          <Field label="Anemia" name="ane" value={form.ane} onChange={handle} options={YN} />
        </div>
      </Accordion>

      <Accordion title="Engineered Features (leave 0 if unknown)">
        <div style={{ marginBottom: 8 }}>
          <div className="alert alert-info" style={{ marginBottom: 12 }}>
            These features are computed by the model training pipeline. If you have the values, enter them. Otherwise leave as 0.
          </div>
          <div className="form-row cols-3">
            <Field label="Age × BP" name="age_bp_interaction" value={form.age_bp_interaction} onChange={handle} />
            <Field label="Glucose / Urea" name="glucose_urea_ratio" value={form.glucose_urea_ratio} onChange={handle} />
            <Field label="Hemo × PCV" name="hemoglobin_pcv_interaction" value={form.hemoglobin_pcv_interaction} onChange={handle} />
          </div>
          <div className="form-row cols-3" style={{ marginTop: 14 }}>
            <Field label="WBC / RBC" name="wbc_rbc_ratio" value={form.wbc_rbc_ratio} onChange={handle} />
            <Field label="Na / K" name="sodium_potassium_ratio" value={form.sodium_potassium_ratio} onChange={handle} />
            <Field label="Albumin × Sugar" name="albumin_sugar_product" value={form.albumin_sugar_product} onChange={handle} />
          </div>
          <div className="form-row cols-3" style={{ marginTop: 14 }}>
            <Field label="Creatinine / Urea" name="creatinine_urea_ratio" value={form.creatinine_urea_ratio} onChange={handle} />
            <Field label="Blood Cell Ratio" name="blood_cell_ratio" value={form.blood_cell_ratio} onChange={handle} />
            <Field label="SG Normalized" name="sg_normalized" value={form.sg_normalized} onChange={handle} />
          </div>
          <div className="form-row cols-3" style={{ marginTop: 14 }}>
            <Field label="BP Normalized" name="bp_normalized" value={form.bp_normalized} onChange={handle} />
            <Field label="BGR Normalized" name="bgr_normalized" value={form.bgr_normalized} onChange={handle} />
            <Field label="BU Normalized" name="bu_normalized" value={form.bu_normalized} onChange={handle} />
          </div>
          <div className="form-row cols-3" style={{ marginTop: 14 }}>
            <Field label="SC Normalized" name="sc_normalized" value={form.sc_normalized} onChange={handle} />
            <Field label="SOD Normalized" name="sod_normalized" value={form.sod_normalized} onChange={handle} />
            <Field label="POT Normalized" name="pot_normalized" value={form.pot_normalized} onChange={handle} />
          </div>
          <div className="form-row cols-3" style={{ marginTop: 14 }}>
            <Field label="HEMO Normalized" name="hemo_normalized" value={form.hemo_normalized} onChange={handle} />
            <Field label="PCV Normalized" name="pcv_normalized" value={form.pcv_normalized} onChange={handle} />
            <Field label="WC Normalized" name="wc_normalized" value={form.wc_normalized} onChange={handle} />
          </div>
          <div className="form-row cols-3" style={{ marginTop: 14 }}>
            <Field label="RC Normalized" name="rc_normalized" value={form.rc_normalized} onChange={handle} />
          </div>
        </div>
      </Accordion>

      <div style={{ marginTop: 16 }}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <><span className="spinner" /> Running…</> : <><Activity size={15} /> Run CKD Prediction</>}
        </button>
      </div>
    </form>
  );
}

/* ── Image Upload Form (Pneumonia + Breast Cancer) ────────────────── */
function ImageForm({ sessionId, model, onResult }) {
  const [file, setFile]   = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');

  const endpoint = model === 'pneumonia' ? '/api/predict/pneumonia' : '/api/predict/breast-cancer';
  const label    = model === 'pneumonia' ? 'Chest X-Ray' : 'Mammogram / Breast Scan';

  const handleFile = e => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async e => {
    e.preventDefault();
    if (!file) { setError('Please select an image file.'); return; }
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('session_id', parseInt(sessionId));
      fd.append('image', file);
      const res = await api.post(endpoint, fd, { headers: { 'Content-Type': undefined } });
      onResult(res.data);
      setFile(null);
      setPreview(null);
    } catch (err) {
      setError(err.response?.data?.detail?.toString() || 'Prediction failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit}>
      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ marginBottom: 20 }}>
        <label className="form-label">{label} Image <span className="required">*</span></label>
        <div style={{
          border: '2px dashed var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: 32,
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.15s',
          marginTop: 6,
        }}
          onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--primary)'; }}
          onDragLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; }}
          onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = 'var(--border)'; const f = e.dataTransfer.files[0]; if (f) { setFile(f); setPreview(URL.createObjectURL(f)); } }}
          onClick={() => document.getElementById(`file-${model}`).click()}
        >
          {preview ? (
            <img src={preview} alt="Preview" style={{ maxHeight: 200, margin: '0 auto', borderRadius: 'var(--radius)' }} />
          ) : (
            <>
              <Upload size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 10px' }} />
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Click to upload or drag and drop
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
                PNG, JPG, JPEG accepted
              </div>
            </>
          )}
        </div>
        <input
          id={`file-${model}`}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleFile}
          style={{ display: 'none' }}
        />
        {file && (
          <div style={{ marginTop: 8, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
          </div>
        )}
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading || !file}>
        {loading
          ? <><span className="spinner" /> Analysing image…</>
          : <><Activity size={15} /> Run {model === 'pneumonia' ? 'Pneumonia' : 'Breast Cancer'} Prediction</>
        }
      </button>
    </form>
  );
}

/* ── Result Panel ─────────────────────────────────────────────────── */
function ResultPanel({ result }) {
  if (!result) return null;
  const isUnavailable = result.status === 'unavailable';

  return (
    <div className={`prediction-result ${isUnavailable ? '' : ''}`} style={{
      marginTop: 24,
      borderColor: isUnavailable ? 'var(--warning-border)' : 'var(--success-border)',
      background: isUnavailable ? 'var(--warning-bg)' : 'var(--success-bg)',
    }}>
      <div className="prediction-result-header">
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {isUnavailable
            ? <AlertTriangle size={18} color="var(--warning)" />
            : <CheckCircle size={18} color="var(--success)" />
          }
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {isUnavailable ? 'Model Unavailable' : 'Prediction Complete'}
          </span>
        </div>
        {!isUnavailable && riskBadge(result.risk_level)}
      </div>

      {isUnavailable ? (
        <p style={{ fontSize: '0.875rem', color: 'var(--warning)' }}>{result.message}</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 14 }}>
            {[
              { label: 'Result', value: result.prediction_label },
              { label: 'Confidence', value: result.probability != null ? `${(result.probability * 100).toFixed(1)}%` : '—' },
              { label: 'Risk Level', value: result.risk_level },
            ].map(({ label, value }) => (
              <div key={label} style={{ padding: '8px 12px', background: 'white', borderRadius: 'var(--radius)', border: '1px solid var(--success-border)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 3 }}>{value || '—'}</div>
              </div>
            ))}
          </div>

          {result.probability != null && (
            <div className="probability-bar-wrap" style={{ marginBottom: 14 }}>
              <div className="probability-bar-label">
                <span>Confidence Score</span>
                <span style={{ fontWeight: 600 }}>{(result.probability * 100).toFixed(1)}%</span>
              </div>
              <div className="probability-bar">
                <div
                  className={`probability-bar-fill ${result.risk_level?.toLowerCase() || ''}`}
                  style={{ width: `${(result.probability * 100).toFixed(1)}%` }}
                />
              </div>
            </div>
          )}

          {result.recommendation && (
            <div style={{
              padding: '10px 14px',
              background: 'white',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--success-border)',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              gap: 8,
            }}>
              <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1, color: 'var(--warning)' }} />
              <span>{result.recommendation}</span>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────── */
const MODELS = [
  { id: 'diabetes',      label: 'Diabetes',      badge: 'badge-diabetes',      desc: 'Tabular — 8 clinical features' },
  { id: 'ckd',           label: 'Kidney Disease', badge: 'badge-ckd',           desc: 'Tabular — 42 features (CKD)' },
  { id: 'pneumonia',     label: 'Pneumonia',      badge: 'badge-pneumonia',     desc: 'CNN — chest X-ray image upload' },
  { id: 'breast_cancer', label: 'Breast Cancer',  badge: 'badge-breast_cancer', desc: 'CNN — mammogram image upload' },
];

export default function RunPrediction() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedSession = searchParams.get('session_id');

  const [sessions, setSessions]     = useState([]);
  const [sessionId, setSessionId]   = useState(preselectedSession || '');
  const [model, setModel]           = useState('diabetes');
  const [result, setResult]         = useState(null);
  const [loadingSessions, setLoadingSessions] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/api/sessions/mine');
        const list = (res.data.sessions || res.data).filter(s => s.status === 'open');
        setSessions(list);
        if (!preselectedSession && list.length === 1) setSessionId(String(list[0].session_id));
      } catch (_) {}
      finally { setLoadingSessions(false); }
    };
    load();
  }, []);

  const handleResult = data => {
    setResult(data);
    window.scrollTo({ top: 9999, behavior: 'smooth' });
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Run Prediction</h1>
        <p>Select a model and enter patient data to run an AI-powered clinical prediction.</p>
      </div>

      {/* ── Session selector ─────────────────────────────────────── */}
      <div className="card mb-6">
        <div className="card-title" style={{ marginBottom: 14 }}>Select Patient Session</div>
        {loadingSessions ? (
          <div className="loading-center" style={{ padding: '20px 0' }}><div className="spinner" /></div>
        ) : sessions.length === 0 ? (
          <div className="alert alert-warning" style={{ margin: 0 }}>
            No open sessions found.&nbsp;
            <a href="/sessions/new" style={{ color: 'inherit', fontWeight: 600, textDecoration: 'underline' }}>Open a session</a> first.
          </div>
        ) : (
          <div className="form-group" style={{ maxWidth: 400 }}>
            <label className="form-label">Open Session <span className="required">*</span></label>
            <select
              className="form-select"
              value={sessionId}
              onChange={e => { setSessionId(e.target.value); setResult(null); }}
            >
              <option value="">Select a session…</option>
              {sessions.map(s => (
                <option key={s.session_id} value={s.session_id}>
                  {s.patient_name} — {s.reason_for_visit?.slice(0, 40)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ── Model selector ───────────────────────────────────────── */}
      <div className="card mb-6">
        <div className="card-title" style={{ marginBottom: 14 }}>Select ML Model</div>
        <div className="grid-4">
          {MODELS.map(m => (
            <button
              key={m.id}
              onClick={() => { setModel(m.id); setResult(null); }}
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius)',
                border: `2px solid ${model === m.id ? 'var(--primary)' : 'var(--border)'}`,
                background: model === m.id ? 'var(--primary-light)' : 'var(--surface)',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <span className={`badge ${m.badge}`} style={{ marginBottom: 6 }}>{m.label}</span>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{m.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Input form ───────────────────────────────────────────── */}
      {sessionId && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">
                {MODELS.find(m => m.id === model)?.label} — Patient Data
              </div>
              <div className="card-subtitle">
                Session #{sessionId} · {sessions.find(s => String(s.session_id) === String(sessionId))?.patient_name}
              </div>
            </div>
          </div>

          {model === 'diabetes'      && <DiabetesForm sessionId={sessionId} onResult={handleResult} />}
          {model === 'ckd'           && <CKDForm sessionId={sessionId} onResult={handleResult} />}
          {model === 'pneumonia'     && <ImageForm sessionId={sessionId} model="pneumonia" onResult={handleResult} />}
          {model === 'breast_cancer' && <ImageForm sessionId={sessionId} model="breast_cancer" onResult={handleResult} />}

          <ResultPanel result={result} />
        </div>
      )}
    </div>
  );
}
