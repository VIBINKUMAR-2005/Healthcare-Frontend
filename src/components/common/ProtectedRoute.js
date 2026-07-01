import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Spinner from './Spinner';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <Spinner fullScreen />;

  if (!user) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to correct dashboard
    const dashboardMap = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/dashboard' };
    return <Navigate to={dashboardMap[user.role] || '/login'} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
