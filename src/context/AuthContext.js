// src/context/AuthContext.js
// ═══════════════════════════════════════════════════════════════════
//  AuthContext — global authentication state
//
//  Provides:
//    - user        : the decoded user object (id, email, full_name, role)
//    - token       : the raw JWT string
//    - isAdmin     : boolean — true when logged in as admin
//    - login()     : stores token + user from a successful login response
//    - adminLogin(): stores admin token + marks admin session
//    - logout()    : clears everything, redirects to /login
//    - loading     : true while we check if a previous session exists
//
//  Storage: sessionStorage (cleared when browser tab closes)
//  Why sessionStorage and not localStorage?
//    Clinical systems should not persist credentials across browser
//    restarts — session storage is wiped when the tab/browser closes.
// ═══════════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  // loading = true while we read from sessionStorage on first mount
  // prevents a flash of "not logged in" on page refresh

  // ── On mount: restore session from sessionStorage ─────────────────
  useEffect(() => {
    try {
      const storedToken   = sessionStorage.getItem('token');
      const storedUser    = sessionStorage.getItem('user');
      const storedIsAdmin = sessionStorage.getItem('isAdmin');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAdmin(storedIsAdmin === 'true');
      }
    } catch (err) {
      // If sessionStorage is corrupt for any reason, clear and start fresh
      sessionStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  // ── login() — called after a successful POST /api/auth/login ──────
  // Expected shape: { access_token: "...", user: { id, email, full_name, role } }
  const login = (data) => {
    const tokenValue = data.access_token;
    const userValue  = data.user || {
      email: data.email,
      full_name: data.full_name,
      role: 'clinician'
    };

    sessionStorage.setItem('token', tokenValue);
    sessionStorage.setItem('user', JSON.stringify(userValue));
    sessionStorage.setItem('isAdmin', 'false');

    setToken(tokenValue);
    setUser(userValue);
    setIsAdmin(false);
  };

  // ── adminLogin() — called after a successful POST /api/auth/admin-login
  const adminLogin = (data) => {
    const tokenValue = data.access_token;
    const adminUser  = { email: data.email || 'admin@clinic.com', role: 'admin', full_name: 'Administrator' };

    sessionStorage.setItem('token', tokenValue);
    sessionStorage.setItem('user', JSON.stringify(adminUser));
    sessionStorage.setItem('isAdmin', 'true');

    setToken(tokenValue);
    setUser(adminUser);
    setIsAdmin(true);
  };

  // ── logout() — clears everything ──────────────────────────────────
  const logout = async () => {
    // Attempt to call the backend logout endpoint (blacklists the token)
    // We do this fire-and-forget — don't block the UI on the result
    try {
      const storedToken = sessionStorage.getItem('token');
      const admin = sessionStorage.getItem('isAdmin') === 'true';
      if (storedToken) {
        const endpoint = admin ? '/api/auth/admin-logout' : '/api/auth/logout';
        await fetch(`http://127.0.0.1:8000${endpoint}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${storedToken}` },
        });
      }
    } catch (_) {
      // Ignore network errors on logout — local clear is enough
    }

    sessionStorage.clear();
    setToken(null);
    setUser(null);
    setIsAdmin(false);
  };

  const value = { user, token, isAdmin, loading, login, adminLogin, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ── useAuth hook — consume the context in any component ─────────────
// Usage:  const { user, login, logout, isAdmin } = useAuth();
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export default AuthContext;
