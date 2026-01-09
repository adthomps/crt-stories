import React, { useEffect, useState } from 'react';
import { isWorkerAdmin } from './auth';
import WorkerLogin from './Login';

export default function WorkerPage() {
  const [auth, setAuth] = useState<'unknown' | 'yes' | 'no'>('unknown');

  useEffect(() => {
    setAuth(isWorkerAdmin() ? 'yes' : 'no');
  }, []);

  function handleLogout() {
    fetch('/api/worker/logout').then(() => {
      window.location.reload();
    });
  }

  if (auth === 'unknown') {
    // SSR or hydration: don't render either view
    return null;
  }
  if (auth === 'no') {
    return <WorkerLogin />;
  }

  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001' }}>
      <h1>Worker Admin Dashboard</h1>
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
