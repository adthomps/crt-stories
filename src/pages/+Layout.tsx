export { Layout };

import React from 'react';
import { siteConfig } from '../config';
import './Layout.css';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout">
      <nav className="nav">
        <div className="nav-content">
          <a href="/" className="nav-logo">{siteConfig.author}</a>
          <div className="nav-links">
            <a href="/worlds">Worlds</a>
            <a href="/series">Series</a>
            <a href="/books">Books</a>
            <a href="/characters">Characters</a>
          </div>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <div className="footer-content">
          <span>&copy; {new Date().getFullYear()} {siteConfig.author}. All rights reserved.</span>
          <span className="footer-site-link">
            <a href="https://crthompson.net" target="_blank" rel="noopener noreferrer">crthompson.net</a>
          </span>
          <span className="footer-ai-note" style={{ fontSize: '0.97rem', color: '#aaa', marginTop: '0.5rem', display: 'block' }}>
            Some images on this site were enhanced or generated with the help of AI.
          </span>
        </div>
      </footer>
    </div>
  );
}
