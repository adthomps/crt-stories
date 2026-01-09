import React from 'react';
import { Navigate } from 'react-router-dom';
import { isWorkerAdmin } from './auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  if (!isWorkerAdmin()) {
    return <Navigate to="/worker" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
