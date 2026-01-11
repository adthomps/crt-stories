import React from "react";

const WorkerDashboard: React.FC = () => {
  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: 24 }}>
      <h1>Worker Admin Dashboard</h1>
      <p>
        Welcome to the worker/admin area. Use the links below to manage content.
      </p>
      <ul style={{ listStyle: "none", padding: 0, marginTop: 32 }}>
        <li style={{ marginBottom: 16 }}>
          <a
            href="/worker/worlds"
            style={{ fontSize: 18, textDecoration: "none", color: "#0070f3" }}
          >
            Manage Worlds
          </a>
        </li>
        <li style={{ marginBottom: 16 }}>
          <a
            href="/worker/series"
            style={{ fontSize: 18, textDecoration: "none", color: "#0070f3" }}
          >
            Manage Series
          </a>
        </li>
        <li style={{ marginBottom: 16 }}>
          <a
            href="/worker/books"
            style={{ fontSize: 18, textDecoration: "none", color: "#0070f3" }}
          >
            Manage Books
          </a>
        </li>
        <li style={{ marginBottom: 16 }}>
          <a
            href="/worker/characters"
            style={{ fontSize: 18, textDecoration: "none", color: "#0070f3" }}
          >
            Manage Characters
          </a>
        </li>
      </ul>
    </div>
  );
};

export default WorkerDashboard;
