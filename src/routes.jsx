import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLogin from './pages/AdminLogin.jsx';
import Dashboard from './pages/Dashboard.jsx';
import PerformancePage from './pages/performance.jsx';

// A component to protect routes that require authentication
const ProtectedRoute = ({ user, children }) => {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// AppRoutes component defines the routing structure
const AppRoutes = ({ user, onLogin, onLogout }) => {
  return (
    <Routes>
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" replace /> : <AdminLogin onLogin={onLogin} />} 
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute user={user}>
            <Dashboard user={user} onLogout={onLogout} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/performance" 
        element={
          <ProtectedRoute user={user}>
            <PerformancePage />
          </ProtectedRoute>
        } 
      />
      {/* Redirect any other path to the dashboard if logged in, or login page if not */}
      <Route path="*" element={<Navigate to={user ? "/" : "/login"} replace />} />
    </Routes>
  );
};

export default AppRoutes;
