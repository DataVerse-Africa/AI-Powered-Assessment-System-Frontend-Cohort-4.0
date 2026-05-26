// src/components/ProtectedRoute.jsx
// ═══════════════════════════════════════════════════════════════════
//  ProtectedRoute — guards pages that require authentication
//
//  Usage:
//    <ProtectedRoute>             ← requires any logged-in user
//      <Dashboard />
//    </ProtectedRoute>
//
//    <ProtectedRoute adminOnly>   ← requires admin JWT
//      <AdminDashboard />
//    </ProtectedRoute>
//
//  Behaviour:
//    - While auth is loading (restoring session) → shows a spinner
//    - Not logged in → redirects to /login (or /admin-login if adminOnly)
//    - Logged in as clinician on admin route → redirects to /admin-login
//    - All checks pass → renders children
// ═══════════════════════════════════════════════════════════════════

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, token, isAdmin, loading } = useAuth();
  const location = useLocation();

  // ── Still restoring session from sessionStorage ───────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '12px',
        background: 'var(--bg)',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-body)',
        fontSize: '0.875rem'
      }}>
        <div className="spinner spinner-lg" />
        <span>Verifying session…</span>
      </div>
    );
  }

  // ── Not authenticated at all ──────────────────────────────────────
  if (!token || !user) {
    if (adminOnly) {
      return <Navigate to="/admin-login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ── Clinician trying to access an admin-only route ────────────────
  if (adminOnly && !isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }

  // ── Admin trying to access clinician routes ───────────────────────
  if (!adminOnly && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // ── All checks passed ─────────────────────────────────────────────
  return children;
}
