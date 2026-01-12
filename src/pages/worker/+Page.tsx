import React, { useEffect, useState } from "react";
import { isWorkerAdmin } from "./auth";
import WorkerLogin from "./Login";

export default function WorkerPage() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(isWorkerAdmin());
  }, []);

  function handleLogout() {
    document.cookie = "worker_admin=; Path=/; Max-Age=0";
    window.location.reload();
  }

  if (!isAdmin) {
    return <WorkerLogin />;
  }

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
    </div>
  );
}
