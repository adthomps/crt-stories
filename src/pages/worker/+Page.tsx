import React, { useEffect, useState } from "react";
import { isWorkerAdmin } from "./auth";
import WorkerLogin from "./Login";
import React from "react";

export default function WorkerPage() {
  // AUTH BYPASS: Always show admin dashboard, never show login form
  function handleLogout() {
    window.location.reload();
  }
  // ---
  return (
    <div
      style={{
        maxWidth: 600,
        margin: "2rem auto",
        padding: "2rem",
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 8px #0001",
      }}
    >
      <h1>Worker Admin Dashboard</h1>
      <div style={{ fontSize: 12, color: "#666", marginBottom: 16 }}>
        Debug: Admin dashboard loaded, authentication is BYPASSED (all users
        allowed)
      </div>
      <ul style={{ listStyle: "none", padding: 0 }}>
        <li>
          <a href="/worker/worlds">Manage Worlds</a>
        </li>
        <li>
          <a href="/worker/series">Manage Series</a>
        </li>
        <li>
          <a href="/worker/books">Manage Books</a>
        </li>
        <li>
          <a href="/worker/characters">Manage Characters</a>
        </li>
      </ul>
      <button
        onClick={handleLogout}
        style={{
          marginTop: 24,
          background: "#c00",
          color: "#fff",
          border: "none",
          padding: "0.5rem 1.5rem",
          borderRadius: 4,
          cursor: "pointer",
        }}
      >
        Logout
      </button>
      <p style={{ marginTop: "2rem", color: "#888" }}>
        (Authentication is currently disabled for testing. All users have
        access.)
      </p>
    </div>
  );
  // ---

  /*
  // ORIGINAL AUTH LOGIC (restore to re-enable authentication)
  const [auth, setAuth] = useState<'unknown' | 'yes' | 'no'>('unknown');
  useEffect(() => {
    const isAuth = isWorkerAdmin();
    setAuth(isAuth ? 'yes' : 'no');
  }, []);
  function handleLogout() {
    fetch('/api/worker/logout').then(() => {
      window.location.reload();
    });
  }
  if (auth === 'unknown') {
    return (
      <div style={{ maxWidth: 400, margin: '4rem auto', padding: 24, textAlign: 'center', color: '#888' }}>
        <div style={{ fontSize: 32, marginBottom: 16 }}>⏳</div>
        Checking authentication...
      </div>
    );
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
  */
}
