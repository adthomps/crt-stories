import React from 'react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  return (
    <div style={{ maxWidth: 600, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001' }}>
      <h1>Admin Dashboard</h1>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        <li><Link to="/admin/books">Manage Books</Link></li>
        <li><Link to="/admin/worlds">Manage Worlds</Link></li>
        <li><Link to="/admin/series">Manage Series</Link></li>
        <li><Link to="/admin/characters">Manage Characters</Link></li>
      </ul>
      <p style={{ marginTop: '2rem', color: '#888' }}>
        (Access to this page is protected by Cloudflare Zero Trust.)
      </p>
    </div>
  );
}
