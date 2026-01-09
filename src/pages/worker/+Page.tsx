import React, { useEffect, useState } from 'react';
import { isWorkerAdmin } from './auth';
import WorkerLogin from './Login';

export default function WorkerPage() {
  console.log('[WorkerPage] Component mounted');
  const [auth, setAuth] = useState<'unknown' | 'yes' | 'no'>('unknown');

  useEffect(() => {
    console.log('[WorkerPage] useEffect running, checking auth...');
    const isAuth = isWorkerAdmin();
    console.log('[WorkerPage] isWorkerAdmin returned:', isAuth);
    setAuth(isAuth ? 'yes' : 'no');
    console.log('[WorkerPage] Auth state set to:', isAuth ? 'yes' : 'no');
  }, []);

  console.log('[WorkerPage] Rendering with auth state:', auth);

  function handleLogout() {
    fetch('/api/worker/logout').then(() => {
      window.location.reload();
    });
  }

  if (auth === 'unknown') {
    console.log('[WorkerPage] Rendering loading state');
    // Always show a loading spinner while checking auth
    return (
      <div style={{ maxWidth: 400, margin: '4rem auto', padding: 24, textAlign: 'center', color: '#888' }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
        Checking authentication...
        <div style={{ fontSize: 12, marginTop: 16, color: '#666' }}>
          Debug: WorkerPage component loaded, auth state = {auth}
        </div>
      </div>
    );
  }
  if (auth === 'no') {
    console.log('[WorkerPage] Rendering login form');
    return <WorkerLogin />;
  }

  console.log('[WorkerPage] Rendering admin dashboard');
  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001' }}>
      <h1>Worker Admin Dashboard</h1>
      <div style={{ fontSize: 12, color: '#666', marginBottom: 16 }}>
        Debug: Admin dashboard loaded, authenticated = true
      </div>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><a href="/worker/books">Manage Books</a></li>
        <li><a href="/worker/worlds">Manage Worlds</a></li>
        <li><a href="/worker/series">Manage Series</a></li>
        <li><a href="/worker/characters">Manage Characters</a></li>
      </ul>
      <button onClick={handleLogout} style={{ marginTop: 24, background: '#c00', color: '#fff', border: 'none', padding: '0.5rem 1.5rem', borderRadius: 4, cursor: 'pointer' }}>Logout</button>
      <p style={{ marginTop: '2rem', color: '#888' }}>
        (Access to this page is protected by authentication.)
      </p>
    </div>
  );
}
