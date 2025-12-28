import React from 'react';

export default function AdminDashboard() {
  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001' }}>
      <h1>Admin Dashboard</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><a href="/admin/books">Manage Books</a></li>
        <li><a href="/admin/worlds">Manage Worlds</a></li>
        <li><a href="/admin/series">Manage Series</a></li>
        <li><a href="/admin/characters">Manage Characters</a></li>
      </ul>
      <p style={{ marginTop: '2rem', color: '#888' }}>
        (Access to this page is protected by Cloudflare Zero Trust.)
      </p>
    </div>
  );
}
