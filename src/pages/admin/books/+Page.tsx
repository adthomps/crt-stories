

// Navigation bar for admin sections

function BackToAdmin() {
  return (
    <div style={{ marginBottom: 24 }}>
      <a href="/admin" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500, fontSize: '1.1rem' }}>&larr; Back to Admin Dashboard</a>
    </div>
  );
}

interface Book {
  slug: string;
  title: string;
  description?: string;
  coverImage?: string;
  publishDate?: string;
  status?: string;
  author?: string;
  worldSlugs?: string[];
  seriesSlugs?: string[];
  characterSlugs?: string[];
  formats?: { type: string; label: string; url: string }[];
  excerpt?: string;
  related?: Record<string, string | null>;
  badges?: string[];
  tags?: string[];
  ogImage?: string;
  published?: boolean;
}

export default function AdminBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  // Removed unused editingBook state
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBooks = () => {
    setLoading(true);
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
  };
  useEffect(fetchBooks, []);

  // Modal form state
  const [form, setForm] = useState<Book>({ slug: '', title: '', description: '', cover_image: '', publish_date: '', kindle_url: '', audio_url: '', paperback_url: '', excerpt: '', world_slug: '', series_id: undefined, published: false });
  // Dropdown data for worlds, series, and characters
  const [worlds, setWorlds] = useState<{ slug: string; title: string }[]>([]);
  const [series, setSeries] = useState<{ slug: string; title: string }[]>([]);
  const [characters, setCharacters] = useState<{ slug: string; name: string }[]>([]);

  // Load worlds, series, and characters for dropdowns and tag display
  useEffect(() => {
    fetch('/api/worker/worlds', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setWorlds(data.map((w: any) => ({ slug: w.slug, title: w.title }))));
    fetch('/api/worker/series', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setSeries(data.map((s: any) => ({ slug: s.slug, title: s.title }))));
    fetch('/api/worker/characters', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setCharacters(data.map((c: any) => ({ slug: c.slug, name: c.name }))));
  }, []);

  // Open modal for add/edit
  const openModal = (mode: 'add' | 'edit', book?: Book) => {
    setModalMode(mode);
    if (book) {
      // Map formats array to individual fields
      let kindle_url = '', audio_url = '', paperback_url = '';
      if (Array.isArray(book.formats)) {
        for (const f of book.formats) {
          if (f.type === 'kindle') kindle_url = f.url;
          if (f.type === 'audiobook' || f.type === 'audio') audio_url = f.url;
          if (f.type === 'paperback') paperback_url = f.url;
        }
      }
      setForm({ ...book, kindle_url, audio_url, paperback_url });
    } else {
      setForm({ slug: '', title: '', description: '', cover_image: '', publish_date: '', kindle_url: '', audio_url: '', paperback_url: '', excerpt: '', world_slug: '', series_id: undefined, published: false });
    }
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    // setEditingBook removed
  };

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm((f) => ({ ...f, [name]: (e.target as HTMLInputElement).checked }));
    } else if (name === 'series_id') {
      setForm((f) => ({ ...f, series_id: value ? Number(value) : undefined }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };

  // Submit add/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      // Map individual fields back to formats array
      const { kindle_url, audio_url, paperback_url, series_id, world_slug, created_at, updated_at, deleted_at, id, amazon_url, ...rest } = form;
      const formats = [];
      if (kindle_url) formats.push({ type: 'kindle', label: 'Kindle', url: kindle_url });
      if (audio_url) formats.push({ type: 'audiobook', label: 'Audiobook', url: audio_url });
      if (paperback_url) formats.push({ type: 'paperback', label: 'Paperback', url: paperback_url });
      // Only send fields expected by backend schema
      const submitData: any = { ...rest, formats };
      // Remove any undefined or null fields
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === undefined || submitData[key] === null || submitData[key] === '') {
          delete submitData[key];
        }
      });
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      const res = await fetch('/api/admin/books', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
        credentials: 'include',
      });
      if (!res.ok) {
        let msg = 'Failed to save book';
        try {
          const data = await res.json();
          if (data && data.error) {
            msg = data.error;
            if (data.details) {
              if (Array.isArray(data.details)) {
                msg += ': ' + data.details.map((d: any) => d.message || JSON.stringify(d)).join('; ');
              } else if (typeof data.details === 'string') {
                msg += ': ' + data.details;
              }
            }
          }
        } catch {}
        setFeedback(msg);
        return;
      }
      setFeedback('Book saved successfully.');
      closeModal();
      fetchBooks();
    } catch (err: any) {
      setFeedback(err.message || 'Error saving book');
    } finally {
      setSubmitting(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteSlug) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/books', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: deleteSlug }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete book');
      setFeedback('Book deleted.');
      setDeleteSlug(null);
      fetchBooks();
    } catch (err: any) {
      setFeedback(err.message || 'Error deleting book');
    } finally {
      setSubmitting(false);
    }
  };

  const accent = '#222b3a';
  const accentLight = '#e6eaf1';
  const border = '#d1d5db';
  const errorColor = '#b91c1c';
  const successColor = '#15803d';

  return (
    <div style={{ maxWidth: 900, margin: '2rem auto', padding: '2rem', background: '#fff', borderRadius: 16, boxShadow: '0 4px 24px #0002', fontFamily: 'inherit' }}>
      <BackToAdmin />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
        <h1 style={{ fontWeight: 700, fontSize: '2rem', color: accent, margin: 0 }}>Manage Books</h1>
        <button
          style={{
            background: accent,
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '10px 28px',
            fontWeight: 700,
            fontSize: '1.1rem',
            cursor: 'pointer',
            boxShadow: '0 1px 4px #0001',
            transition: 'background 0.2s',
            outline: 'none',
            letterSpacing: 0.5,
          }}
          onClick={() => openModal('add')}
          onMouseOver={e => (e.currentTarget.style.background = '#1a2230')}
          onMouseOut={e => (e.currentTarget.style.background = accent)}
        >
          + Add Book
        </button>
      </div>
      {feedback && <div style={{ margin: '1rem 0', color: feedback.toLowerCase().includes('error') ? errorColor : successColor, fontWeight: 500 }}>{feedback}</div>}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: errorColor }}>{error}</p>}
      {!loading && !error && (
        books.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#888', fontSize: '1.1rem', background: accentLight, borderRadius: 12, marginTop: 24 }}>
            No books found. Click <b>+ Add Book</b> to create your first book.
          </div>
        ) : (
          <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 8px #0001', background: accentLight }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem' }}>
              <thead>
                <tr style={{ background: accent, color: '#fff' }}>
                  <th style={{ padding: 14, borderBottom: `2px solid ${border}`, textAlign: 'left', fontSize: '1.05rem' }}>Title</th>
                  <th style={{ padding: 14, borderBottom: `2px solid ${border}`, textAlign: 'left', fontSize: '1.05rem' }}>Series</th>
                  <th style={{ padding: 14, borderBottom: `2px solid ${border}`, textAlign: 'left', fontSize: '1.05rem' }}>Worlds</th>
                  <th style={{ padding: 14, borderBottom: `2px solid ${border}`, textAlign: 'left', fontSize: '1.05rem' }}>Characters</th>
                  <th style={{ padding: 14, borderBottom: `2px solid ${border}`, textAlign: 'left', fontSize: '1.05rem' }}>Published Date</th>
                  <th style={{ padding: 14, borderBottom: `2px solid ${border}`, textAlign: 'left', fontSize: '1.05rem' }}>Published</th>
                  <th style={{ padding: 14, borderBottom: `2px solid ${border}`, textAlign: 'left', fontSize: '1.05rem' }}>Edit</th>
                  <th style={{ padding: 14, borderBottom: `2px solid ${border}`, textAlign: 'left', fontSize: '1.05rem' }}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book, i) => {
                  // Get series titles
                  const seriesTitles = (book.seriesSlugs || []).map(slug => {
                    const s = series.find(s => s.slug === slug);
                    return s ? s.title : slug;
                  });
                  // Get world titles
                  const worldTitles = (book.worldSlugs || []).map(slug => {
                    const w = worlds.find(w => w.slug === slug);
                    return w ? w.title : slug;
                  });
                  // Get character names
                  const characterNames = (book.characterSlugs || []).map(slug => {
                    const c = characters.find(c => c.slug === slug);
                    return c ? c.name : slug;
                  });
                  return (
                    <tr
                      key={book.slug}
                      style={{
                        background: i % 2 === 0 ? '#fff' : accentLight,
                        transition: 'background 0.2s',
                      }}
                      onMouseOver={e => (e.currentTarget.style.background = '#f3f4f6')}
                      onMouseOut={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : accentLight)}
                    >
                      <td style={{ padding: 14 }}>{book.title}</td>
                      <td style={{ padding: 14 }}>
                        {seriesTitles.length > 0 ? seriesTitles.map(title => (
                          <span key={title} style={{ background: '#e0e7ff', color: '#3730a3', borderRadius: 6, padding: '2px 8px', marginRight: 4, fontSize: 13 }}>{title}</span>
                        )) : <span style={{ color: '#bbb' }}>—</span>}
                      </td>
                      <td style={{ padding: 14 }}>
                        {worldTitles.length > 0 ? worldTitles.map(title => (
                          <span key={title} style={{ background: '#fef9c3', color: '#92400e', borderRadius: 6, padding: '2px 8px', marginRight: 4, fontSize: 13 }}>{title}</span>
                        )) : <span style={{ color: '#bbb' }}>—</span>}
                      </td>
                      <td style={{ padding: 14 }}>
                        {characterNames.length > 0 ? characterNames.map(name => (
                          <span key={name} style={{ background: '#d1fae5', color: '#065f46', borderRadius: 6, padding: '2px 8px', marginRight: 4, fontSize: 13 }}>{name}</span>
                        )) : <span style={{ color: '#bbb' }}>—</span>}
                      </td>
                      <td style={{ padding: 14 }}>{book.publishDate || <span style={{ color: '#bbb' }}>—</span>}</td>
                      <td style={{ padding: 14 }}>{book.published ? 'Yes' : 'No'}</td>
                      <td style={{ padding: 14 }}>
                        <button
                          style={{
                            background: accent,
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            padding: '6px 18px',
                            fontWeight: 600,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            outline: 'none',
                          }}
                          onClick={() => openModal('edit', book)}
                          onMouseOver={e => (e.currentTarget.style.background = '#1a2230')}
                          onMouseOut={e => (e.currentTarget.style.background = accent)}
                          tabIndex={0}
                          aria-label={`Edit ${book.title}`}
                        >Edit</button>
                      </td>
                      <td style={{ padding: 14 }}>
                        <button
                          style={{
                            background: errorColor,
                            color: '#fff',
                            border: 'none',
                            borderRadius: 4,
                            padding: '6px 18px',
                            fontWeight: 600,
                            fontSize: '1rem',
                            cursor: 'pointer',
                            transition: 'background 0.2s',
                            outline: 'none',
                          }}
                          onClick={() => setDeleteSlug(book.slug)}
                          onMouseOver={e => (e.currentTarget.style.background = '#991b1b')}
                          onMouseOut={e => (e.currentTarget.style.background = errorColor)}
                          tabIndex={0}
                          aria-label={`Delete ${book.title}`}
                        >Delete</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Modal for Add/Edit */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 36, borderRadius: 14, minWidth: 350, maxWidth: 700, width: '100%', boxShadow: '0 4px 24px #0003', position: 'relative', fontFamily: 'inherit', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: 18, color: accent }}>{modalMode === 'add' ? 'Add Book' : 'Edit Book'}</h2>
            {/* Basic Info */}
            <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 18, padding: 16 }}>
              <legend style={{ fontWeight: 600, color: accent }}>Basic Info</legend>
              <label style={{ fontWeight: 500 }}>Title
                <input name="title" value={form.title} onChange={handleFormChange} required style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 4, border: `1px solid ${border}` }} placeholder="e.g. Power Seven" />
              </label>
              <label style={{ fontWeight: 500 }}>Slug
                <input name="slug" value={form.slug} onChange={handleFormChange} required disabled={modalMode === 'edit'} style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 4, border: `1px solid ${border}` }} placeholder="e.g. power-seven" pattern="^[a-z0-9-]+$" maxLength={64} />
                <div style={{ fontSize: 12, color: '#888' }}>Lowercase, alphanumeric, hyphens only. Example: <code>power-seven</code></div>
              </label>
            </fieldset>

            {/* Series & World */}
            <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 18, padding: 16 }}>
              <legend style={{ fontWeight: 600, color: accent }}>Series &amp; World</legend>
              <label style={{ fontWeight: 500 }}>Series
                <select name="series_id" value={form.series_id ?? ''} onChange={handleFormChange} style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 4, border: `1px solid ${border}` }}>
                  <option value="">-- None --</option>
                  {series.map((s, idx) => (
                    <option key={s.slug} value={idx + 1}>{s.title} (ID {idx + 1})</option>
                  ))}
                </select>
                <div style={{ fontSize: 12, color: '#888' }}>Select the series this book belongs to (optional). Series ID is assigned by order in series.json.</div>
              </label>
              <label style={{ fontWeight: 500 }}>World
                <select name="world_slug" value={form.world_slug || ''} onChange={handleFormChange} style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 4, border: `1px solid ${border}` }}>
                  <option value="">-- None --</option>
                  {worlds.map(w => (
                    <option key={w.slug} value={w.slug}>{w.title} ({w.slug})</option>
                  ))}
                </select>
                <div style={{ fontSize: 12, color: '#888' }}>Select the world this book belongs to (optional).</div>
              </label>
            </fieldset>

            {/* Description */}
            <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 18, padding: 16 }}>
              <legend style={{ fontWeight: 600, color: accent }}>Description</legend>
              <label style={{ fontWeight: 500 }}>Description
                <textarea name="description" value={form.description} onChange={handleFormChange} style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 4, border: `1px solid ${border}` }} placeholder="Short summary or blurb" />
              </label>
            </fieldset>

            {/* Media */}
            <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 18, padding: 16 }}>
              <legend style={{ fontWeight: 600, color: accent }}>Media</legend>
              <label style={{ fontWeight: 500 }}>Cover Image URL
                <input name="cover_image" value={form.cover_image} onChange={handleFormChange} style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 4, border: `1px solid ${border}` }} placeholder="/images/books/power-seven.jpg or https://..." />
                <div style={{ fontSize: 12, color: '#888' }}>Relative to <code>/public/images/books/</code> or a full URL.</div>
              </label>
            </fieldset>

            {/* Purchase Links */}
            <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 18, padding: 16 }}>
              <legend style={{ fontWeight: 600, color: accent }}>Purchase Links</legend>
              <label style={{ fontWeight: 500 }}>Kindle URL
                <input name="kindle_url" value={form.kindle_url} onChange={handleFormChange} style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 4, border: `1px solid ${border}` }} placeholder="https://amazon.com/kindle-dp/XXXXXXXX" />
                <div style={{ fontSize: 12, color: '#888' }}>Direct link to Kindle edition (optional).</div>
              </label>
              <label style={{ fontWeight: 500 }}>Audio URL
                <input name="audio_url" value={form.audio_url} onChange={handleFormChange} style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 4, border: `1px solid ${border}` }} placeholder="https://amazon.com/audio-dp/XXXXXXXX" />
                <div style={{ fontSize: 12, color: '#888' }}>Direct link to Audible or audio edition (optional).</div>
              </label>
              <label style={{ fontWeight: 500 }}>Paperback URL
                <input name="paperback_url" value={form.paperback_url} onChange={handleFormChange} style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 4, border: `1px solid ${border}` }} placeholder="https://amazon.com/paperback-dp/XXXXXXXX" />
                <div style={{ fontSize: 12, color: '#888' }}>Direct link to paperback or print edition (optional).</div>
              </label>
            </fieldset>

            {/* Excerpt */}
            <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 18, padding: 16 }}>
              <legend style={{ fontWeight: 600, color: accent }}>Excerpt</legend>
              <label style={{ fontWeight: 500 }}>Excerpt
                <input name="excerpt" value={form.excerpt} onChange={handleFormChange} style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 4, border: `1px solid ${border}` }} placeholder="Optional excerpt or sample text" />
              </label>
            </fieldset>

            {/* Publication */}
            <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 18, padding: 16 }}>
              <legend style={{ fontWeight: 600, color: accent }}>Publication</legend>
              <label style={{ fontWeight: 500 }}>Publish Date
                <input name="publish_date" value={form.publish_date} onChange={handleFormChange} style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 4, border: `1px solid ${border}` }} placeholder="YYYY-MM-DD" />
                <div style={{ fontSize: 12, color: '#888' }}>Format: <code>YYYY-MM-DD</code> (e.g. 2025-12-28)</div>
              </label>
              <label style={{ fontWeight: 500 }}><input type="checkbox" name="published" checked={!!form.published} onChange={handleFormChange} style={{ marginRight: 6 }} /> Published
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Checked: Book is visible on the public site. Unchecked: Book is hidden (draft).</div>
              </label>
            </fieldset>

            <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
              <button type="submit" disabled={submitting} style={{ background: accent, color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 1px 4px #0001', transition: 'background 0.2s' }}>{submitting ? 'Saving...' : 'Save'}</button>
              <button type="button" onClick={closeModal} style={{ background: '#fff', color: accent, border: `1px solid ${border}`, borderRadius: 6, padding: '8px 20px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', transition: 'background 0.2s' }}>Cancel</button>
            </div>
            {feedback && <div style={{ color: errorColor, marginTop: 12 }}>{feedback}</div>}
          </form>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteSlug && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 36, borderRadius: 14, minWidth: 300, boxShadow: '0 4px 24px #0003', textAlign: 'center', fontFamily: 'inherit' }}>
            <p style={{ fontWeight: 500, fontSize: '1.1rem', marginBottom: 18 }}>Are you sure you want to delete this book?</p>
            <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={handleDelete} disabled={submitting} style={{ background: errorColor, color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', transition: 'background 0.2s' }}>{submitting ? 'Deleting...' : 'Delete'}</button>
              <button onClick={() => setDeleteSlug(null)} style={{ background: '#fff', color: accent, border: `1px solid ${border}`, borderRadius: 6, padding: '8px 20px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', transition: 'background 0.2s' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useEffect, useState } from 'react';
