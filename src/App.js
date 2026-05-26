// src/App.js
// ═══════════════════════════════════════════════════════════════════
//  App — root component, defines all routes
//
//  Layout:
//    - Auth pages (Login, Register, AdminLogin) → full screen, no sidebar
//    - Clinician pages → Sidebar + Navbar + main content
//    - Admin pages     → Sidebar + Navbar + main content
//
//  Route protection:
//    - All clinician pages wrapped in <ProtectedRoute>
//    - All admin pages wrapped in <ProtectedRoute adminOnly>
// ═══════════════════════════════════════════════════════════════════

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Auth pages
import Login       from './pages/Login';
import Register    from './pages/Register';
import AdminLogin  from './pages/admin/AdminLogin';

// Clinician pages
import Dashboard      from './pages/Dashboard';
import NewSession     from './pages/NewSession';
import SessionHistory from './pages/SessionHistory';
import SessionDetail  from './pages/SessionDetail';
import RunPrediction  from './pages/RunPrediction';
import Chatbot        from './pages/Chatbot';

// Admin pages
import AdminDashboard   from './pages/admin/AdminDashboard';
import AdminClinicians  from './pages/admin/AdminClinicians';
import AdminSessions    from './pages/admin/AdminSessions';
import AdminPredictions from './pages/admin/AdminPredictions';
import AdminExport      from './pages/admin/AdminExport';

import './styles/global.css';

// ── Authenticated layout — wraps all protected pages ──────────────
function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <Outlet />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ── Public auth routes ──────────────────────────────── */}
          <Route path="/login"        element={<Login />} />
          <Route path="/register"     element={<Register />} />
          <Route path="/admin-login"  element={<AdminLogin />} />

          {/* ── Clinician protected routes ──────────────────────── */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard"             element={<Dashboard />} />
            <Route path="/sessions/new"          element={<NewSession />} />
            <Route path="/sessions"              element={<SessionHistory />} />
            <Route path="/sessions/:id"          element={<SessionDetail />} />
            <Route path="/predictions"           element={<RunPrediction />} />
            <Route path="/chatbot"               element={<Chatbot />} />
          </Route>

          {/* ── Admin protected routes ──────────────────────────── */}
          <Route
            element={
              <ProtectedRoute adminOnly>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard"   element={<AdminDashboard />} />
            <Route path="/admin/clinicians"  element={<AdminClinicians />} />
            <Route path="/admin/sessions"    element={<AdminSessions />} />
            <Route path="/admin/predictions" element={<AdminPredictions />} />
            <Route path="/admin/export"      element={<AdminExport />} />
          </Route>

          {/* ── Redirects ───────────────────────────────────────── */}
          <Route path="/"  element={<Navigate to="/login" replace />} />
          <Route path="*"  element={<Navigate to="/login" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
