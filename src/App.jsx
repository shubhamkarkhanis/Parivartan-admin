import React, { useState, useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRoutes from './routes'; // Import your routes

const App = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for a logged-in user
    const savedUser = null; // In a real app, you'd get this from localStorage
    
    setTimeout(() => {
      if (savedUser) {
        setUser(savedUser);
      }
      setIsLoading(false);
    }, 500);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    // In a real app, you would save the user/token to localStorage here
  };

  const handleLogout = () => {
    setUser(null);
    // In a real app, you would clear localStorage here
  };

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

  // The router now controls which page is displayed based on the URL
  return (
    <BrowserRouter>
      <AppRoutes user={user} onLogin={handleLogin} onLogout={handleLogout} />
    </BrowserRouter>
  );
};

export default App;