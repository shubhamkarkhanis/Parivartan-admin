import React, { useState, useEffect } from 'react';
import AdminLogin from './pages/AdminLogin';
import Dashboard from './pages/Dashboard';

const App = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (simulate checking localStorage)
    // In a real app, you would check localStorage or make an API call to validate token
    const savedUser = null; // JSON.parse(localStorage.getItem('user'))
    
    setTimeout(() => {
      if (savedUser) {
        setUser(savedUser);
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    }, 500);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    // In a real app: localStorage.setItem('user', JSON.stringify(userData))
    // Also set authentication token for API calls
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    // In a real app: 
    // localStorage.removeItem('user')
    // localStorage.removeItem('token')
    // Clear any API tokens
  };

  // Loading screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Civic Dashboard...</p>
        </div>
      </div>
    );
  }

  // Render based on authentication status
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
};

export default App;