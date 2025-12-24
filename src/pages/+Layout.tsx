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
            <a href="/books">Books</a>
            <a href="/worlds">Worlds</a>
            <a href="/characters">Characters</a>
          </div>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} {siteConfig.author}. All rights reserved.</p>
      </footer>
    </div>
  );
}
