// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  // Check for a token in localStorage (our fake login)
  const isAuthenticated = localStorage.getItem('authToken');

  // If authenticated, show the child components (the dashboard).
  // Otherwise, redirect to the login page.
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;