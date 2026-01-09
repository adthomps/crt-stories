import React from 'react';
import { isWorkerAdmin } from './auth';
import { useLocation, Navigate } from 'react-router-dom';

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isAuth = isWorkerAdmin();
  const isLoginPage = location.pathname === '/worker';

  if (!isAuth && !isLoginPage) {
    return <Navigate to="/worker" replace />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f7' }}>
      <header style={{ padding: '1rem', background: '#222', color: '#fff' }}>
        <h2>Worker Admin Area</h2>
      </header>
      <main>{children}</main>
    </div>
  );
}
