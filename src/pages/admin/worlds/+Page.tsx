
// Navigation bar for admin sections

function BackToAdmin() {
  return (
    <div style={{ marginBottom: 24 }}>
      <a href="/admin" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500, fontSize: '1.1rem' }}>&larr; Back to Admin Dashboard</a>
    </div>
  );
}

interface World {
  slug: string;
  title: string;
  description?: string;
  published?: boolean;
  bookSlugs?: string[];
  characterSlugs?: string[];
}

export default function AdminWorldsPage() {
  const [worlds, setWorlds] = useState<World[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingWorld, setEditingWorld] = useState<World | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchWorlds = () => {
    setLoading(true);
    fetch('/api/admin/worlds', {
      headers: { 'Accept': 'application/json' },
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch worlds');
        return res.json();
      })
      .then(setWorlds)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };
  useEffect(fetchWorlds, []);

  // Dropdown data for books and characters
  const [books, setBooks] = useState<{ slug: string; title: string }[]>([]);
  const [characters, setCharacters] = useState<{ slug: string; name: string }[]>([]);

  // Load books and characters for tag display
  useEffect(() => {
    fetch('/api/worker/books', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setBooks(data.map((b: any) => ({ slug: b.slug, title: b.title }))));
    fetch('/api/worker/characters', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setCharacters(data.map((c: any) => ({ slug: c.slug, name: c.name }))));
  }, []);

  // Open modal for add/edit
  const openModal = (mode: 'add' | 'edit', w?: World) => {
    setModalMode(mode);
    setEditingWorld(w || null);
    setForm(w ? { ...w } : { slug: '', title: '', description: '', published: false });
    setModalOpen(true);
        // --- Zod validation ---
        const result = WorldSchema.safeParse(submitData);
        if (!result.success) {
          const errorMessages = result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('; ');
          setFeedback('Validation error: ' + errorMessages);
          setSubmitting(false);
          return;
        }
        // --- End Zod validation ---
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditingWorld(null);
  };

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  // Submit add/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      const res = await fetch('/api/admin/worlds', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to save world');
      setFeedback('World saved successfully.');
      closeModal();
      fetchWorlds();
    } catch (err: any) {
      setFeedback(err.message || 'Error saving world');
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
      const res = await fetch('/api/admin/worlds', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: deleteSlug }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete world');
      setFeedback('World deleted.');
      setDeleteSlug(null);
      fetchWorlds();
    } catch (err: any) {
      setFeedback(err.message || 'Error deleting world');
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
      <h1 style={{ fontWeight: 700, fontSize: '2rem', marginBottom: 8, color: accent }}>Manage Worlds</h1>
      <button
        style={{
          marginBottom: 20,
          background: accent,
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '8px 20px',
          fontWeight: 600,
          fontSize: '1rem',
          cursor: 'pointer',
          boxShadow: '0 1px 4px #0001',
          transition: 'background 0.2s',
        }}
        onClick={() => openModal('add')}
        onMouseOver={e => (e.currentTarget.style.background = '#1a2230')}
        onMouseOut={e => (e.currentTarget.style.background = accent)}
      >
        Add World
      </button>
      {feedback && <div style={{ margin: '1rem 0', color: feedback.toLowerCase().includes('error') ? errorColor : successColor, fontWeight: 500 }}>{feedback}</div>}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: errorColor }}>{error}</p>}
      {!loading && !error && (
        <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 8px #0001', background: accentLight }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem' }}>
            <thead>
              <tr style={{ background: accent, color: '#fff' }}>
                <th style={{ padding: 12, borderBottom: `2px solid ${border}`, textAlign: 'left' }}>Title</th>
                <th style={{ padding: 12, borderBottom: `2px solid ${border}`, textAlign: 'left' }}>Slug</th>
                <th style={{ padding: 12, borderBottom: `2px solid ${border}`, textAlign: 'left' }}>Books</th>
                <th style={{ padding: 12, borderBottom: `2px solid ${border}`, textAlign: 'left' }}>Characters</th>
                <th style={{ padding: 12, borderBottom: `2px solid ${border}`, textAlign: 'left' }}>Published</th>
                <th style={{ padding: 12, borderBottom: `2px solid ${border}`, textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {worlds.map((w, i) => {
                // Get book titles
                const bookTitles = (w.bookSlugs || []).map(slug => {
                  const b = books.find(b => b.slug === slug);
                  return b ? b.title : slug;
                });
                // Get character names
                const characterNames = (w.characterSlugs || []).map(slug => {
                  const c = characters.find(c => c.slug === slug);
                  return c ? c.name : slug;
                });
                return (
                  <tr
                    key={w.slug}
                    style={{
                      background: i % 2 === 0 ? '#fff' : accentLight,
                      transition: 'background 0.2s',
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = '#f3f4f6')}
                    onMouseOut={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : accentLight)}
                  >
                    <td style={{ padding: 12 }}>{w.title}</td>
                    <td style={{ padding: 12 }}>{w.slug}</td>
                    <td style={{ padding: 12 }}>
                      {bookTitles.length > 0 ? bookTitles.map(title => (
                        <span key={title} style={{ background: '#e0e7ff', color: '#3730a3', borderRadius: 6, padding: '2px 8px', marginRight: 4, fontSize: 13 }}>{title}</span>
                      )) : <span style={{ color: '#bbb' }}>—</span>}
                    </td>
                    <td style={{ padding: 12 }}>
                      {characterNames.length > 0 ? characterNames.map(name => (
                        <span key={name} style={{ background: '#d1fae5', color: '#065f46', borderRadius: 6, padding: '2px 8px', marginRight: 4, fontSize: 13 }}>{name}</span>
                      )) : <span style={{ color: '#bbb' }}>—</span>}
                    </td>
                    <td style={{ padding: 12 }}>{w.published ? 'Yes' : 'No'}</td>
                    <td style={{ padding: 12 }}>
                      <button
                        style={{
                          marginRight: 8,
                          background: accent,
                          color: '#fff',
                          border: 'none',
                          borderRadius: 4,
                          padding: '4px 14px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onClick={() => openModal('edit', w)}
                        onMouseOver={e => (e.currentTarget.style.background = '#1a2230')}
                        onMouseOut={e => (e.currentTarget.style.background = accent)}
                      >Edit</button>
                      <button
                        style={{
                          background: errorColor,
                          color: '#fff',
                          border: 'none',
                          borderRadius: 4,
                          padding: '4px 14px',
                          fontWeight: 500,
                          cursor: 'pointer',
                          transition: 'background 0.2s',
                        }}
                        onClick={() => setDeleteSlug(w.slug)}
                        onMouseOver={e => (e.currentTarget.style.background = '#991b1b')}
                        onMouseOut={e => (e.currentTarget.style.background = errorColor)}
                      >Delete</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Add/Edit */}
      {modalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <form onSubmit={handleSubmit} style={{ background: '#fff', padding: 36, borderRadius: 14, minWidth: 350, maxWidth: 500, boxShadow: '0 4px 24px #0003', position: 'relative', fontFamily: 'inherit' }}>
            <h2 style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: 18, color: accent }}>{modalMode === 'add' ? 'Add World' : 'Edit World'}</h2>
            {/* Basic Info */}
            <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 18, padding: 16 }}>
              <legend style={{ fontWeight: 600, color: accent }}>Basic Info</legend>
              <label style={{ fontWeight: 500 }} htmlFor="title">Title *</label>
              <input id="title" name="title" value={form.title} onChange={handleFormChange} onBlur={handleBlur} required aria-invalid={!!errors.title} aria-describedby={errors.title ? 'title-error' : undefined} style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 4, border: `1px solid ${errors.title ? errorColor : border}` }} placeholder="e.g. Tales of the Labyrinth Nebula" />
              {errors.title && <div id="title-error" style={{ color: errorColor, fontSize: 13, marginBottom: 8 }} role="alert">{errors.title}</div>}

              <label style={{ fontWeight: 500 }} htmlFor="slug">Slug *</label>
              <input id="slug" name="slug" value={form.slug} onChange={handleFormChange} onBlur={handleBlur} required disabled={modalMode === 'edit'} aria-invalid={!!errors.slug} aria-describedby={errors.slug ? 'slug-error' : undefined} style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 4, border: `1px solid ${errors.slug ? errorColor : border}` }} placeholder="e.g. labyrinth-nebula" pattern="^[a-z0-9-]+$" maxLength={64} />
              <div style={{ fontSize: 12, color: '#888' }}>Lowercase, alphanumeric, hyphens only. Example: <code>labyrinth-nebula</code></div>
              {errors.slug && <div id="slug-error" style={{ color: errorColor, fontSize: 13, marginBottom: 8 }} role="alert">{errors.slug}</div>}
            </fieldset>

            {/* Description */}
            <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 18, padding: 16 }}>
              <legend style={{ fontWeight: 600, color: accent }}>Description</legend>
              <label style={{ fontWeight: 500 }} htmlFor="description">Description</label>
              <textarea id="description" name="description" value={form.description} onChange={handleFormChange} onBlur={handleBlur} aria-invalid={!!errors.description} aria-describedby={errors.description ? 'description-error' : undefined} style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 4, border: `1px solid ${errors.description ? errorColor : border}` }} placeholder="Short summary or blurb" />
              {errors.description && <div id="description-error" style={{ color: errorColor, fontSize: 13, marginBottom: 8 }} role="alert">{errors.description}</div>}
            </fieldset>

            {/* Publication */}
            <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 18, padding: 16 }}>
              <legend style={{ fontWeight: 600, color: accent }}>Publication</legend>
              <label style={{ fontWeight: 500 }} htmlFor="published"><input id="published" type="checkbox" name="published" checked={!!form.published} onChange={handleFormChange} onBlur={handleBlur} aria-invalid={!!errors.published} aria-describedby={errors.published ? 'published-error' : undefined} style={{ marginRight: 6 }} /> Published</label>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Checked: World is visible on the public site. Unchecked: World is hidden (draft).</div>
              {errors.published && <div id="published-error" style={{ color: errorColor, fontSize: 13, marginBottom: 8 }} role="alert">{errors.published}</div>}
            </fieldset>

            <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
              <button type="submit" disabled={submitting} style={{ background: accent, color: '#fff', border: 'none', borderRadius: 6, padding: '8px 20px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', boxShadow: '0 1px 4px #0001', transition: 'background 0.2s', position: 'relative' }}>
                {submitting ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <span className="spinner" style={{ width: 18, height: 18, border: '2px solid #fff', borderTop: `2px solid ${accentLight}`, borderRadius: '50%', display: 'inline-block', marginRight: 8, animation: 'spin 1s linear infinite' }} />
                    Saving...
                  </span>
                ) : 'Save'}
              </button>
              <button type="button" onClick={closeModal} style={{ background: '#fff', color: accent, border: `1px solid ${border}`, borderRadius: 6, padding: '8px 20px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer', transition: 'background 0.2s' }}>Cancel</button>
            </div>
            {feedback && !feedback.toLowerCase().includes('successfully') && (
              <div style={{ color: errorColor, marginTop: 12 }}>{feedback}</div>
            )}
            {feedback && feedback.toLowerCase().includes('successfully') && (
              <div style={{ color: successColor, marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{feedback}</span>
                <button type="button" aria-label="Dismiss" onClick={() => setFeedback(null)} style={{ background: 'none', border: 'none', color: successColor, fontWeight: 700, fontSize: 18, cursor: 'pointer', marginLeft: 8 }}>&times;</button>
              </div>
            )}
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </form>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteSlug && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: '#0008', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', padding: 36, borderRadius: 14, minWidth: 300, boxShadow: '0 4px 24px #0003', textAlign: 'center', fontFamily: 'inherit' }}>
            <p style={{ fontWeight: 500, fontSize: '1.1rem', marginBottom: 18 }}>Are you sure you want to delete this world?</p>
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
import React, { useState, useEffect } from 'react';
