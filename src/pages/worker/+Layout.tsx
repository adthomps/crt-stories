import React from 'react';
import { isWorkerAdmin } from './auth';

export default function WorkerLayout({ children }: { children: React.ReactNode }) {
  // This layout is only used for authenticated worker sub-pages
  return (
    <div style={{ minHeight: '100vh', background: '#f7f7f7' }}>
      <header style={{ padding: '1rem', background: '#222', color: '#fff' }}>
        <h2>Worker Admin Area</h2>
        <nav>
          <a href="/worker/books" style={{ color: '#fff', marginRight: 16 }}>Books</a>
          <a href="/worker/worlds" style={{ color: '#fff', marginRight: 16 }}>Worlds</a>
          <a href="/worker/series" style={{ color: '#fff', marginRight: 16 }}>Series</a>
          <a href="/worker/characters" style={{ color: '#fff' }}>Characters</a>
        </nav>
      </header>
      <main>{children}</main>
    </div>
  );
}
