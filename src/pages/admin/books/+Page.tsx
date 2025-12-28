import React, { useEffect, useState } from 'react';

interface Book {
  slug: string;
  title: string;
  description?: string;
  cover_image?: string;
  publish_date?: string;
  amazon_url?: string;
  kindle_url?: string;
  excerpt?: string;
  world_slug?: string;
  series_id?: number;
  published?: boolean;
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/books', {
      headers: { 'Accept': 'application/json' },
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch books');
        return res.json();
      })
      .then(setBooks)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 800, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 8, boxShadow: '0 2px 8px #0001' }}>
      <h1>Manage Books</h1>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && !error && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Title</th>
              <th>Slug</th>
              <th>Published</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.slug}>
                <td>{book.title}</td>
                <td>{book.slug}</td>
                <td>{book.published ? 'Yes' : 'No'}</td>
                <td>
                  {/* TODO: Add Edit/Delete buttons */}
                  <button disabled>Edit</button>
                  <button disabled>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
