
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();

  // Read the saved login session safely
  let user = null;
  let token = null;

  try {
    token = localStorage.getItem('nexora_token');
    user = JSON.parse(localStorage.getItem('nexora_user') || 'null');
  } catch (error) {
    console.error('Unable to read login session:', error);
  }

  // A valid frontend session requires both token and user information
  const isAuthenticated =
    typeof token === 'string' &&
    token.trim().length > 0 &&
    user !== null &&
    typeof user === 'object' &&
    typeof user.role === 'string';

  // Redirect unauthenticated users to login
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Redirect authenticated users with the wrong role
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/" replace />;
  }

  // Allow access to the requested protected page
  return <Outlet />;
};

export default ProtectedRoute;
