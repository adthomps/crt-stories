
// Navigation bar for admin sections

function BackToAdmin() {
  return (
    <div style={{ marginBottom: 24 }}>
      <a href="/admin" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 500, fontSize: '1.1rem' }}>&larr; Back to Admin Dashboard</a>
    </div>
  );
}

interface Character {
  slug: string;
  name: string;
  description?: string;
  worldSlugs?: string[];
  appearsInBookSlugs?: string[];
  seriesSlugs?: string[];
  published?: boolean;
}

export default function AdminCharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchCharacters = () => {
    setLoading(true);
    fetch('/api/admin/characters', {
      headers: { 'Accept': 'application/json' },
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch characters');
        return res.json();
      })
      .then(setCharacters)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };
  useEffect(fetchCharacters, []);

  // Dropdown data for worlds, books, and series
  const [worlds, setWorlds] = useState<{ slug: string; title: string }[]>([]);
  const [books, setBooks] = useState<{ slug: string; title: string }[]>([]);
  const [series, setSeries] = useState<{ slug: string; title: string }[]>([]);

  // Load worlds, books, and series for tag display
  useEffect(() => {
    fetch('/api/worker/worlds', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setWorlds(data.map((w: any) => ({ slug: w.slug, title: w.title }))));
    fetch('/api/worker/books', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setBooks(data.map((b: any) => ({ slug: b.slug, title: b.title }))));
    fetch('/api/worker/series', { credentials: 'include' })
      .then(res => res.json())
      .then(data => setSeries(data.map((s: any) => ({ slug: s.slug, title: s.title }))));
  }, []);

  // Open modal for add/edit
  const openModal = (mode: 'add' | 'edit', c?: Character) => {
    setModalMode(mode);
    setEditingCharacter(c || null);
    setForm(c ? { ...c } : { slug: '', name: '', description: '', world_slug: '', published: false });
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditingCharacter(null);
  };

  // Helper to get user-friendly error messages
  const friendlyError = (err: z.ZodIssue) => {
    if (err.path[0] === 'slug' && err.code === 'invalid_string') return 'Slug must be lowercase, alphanumeric, and use hyphens.';
    if (err.path[0] === 'name' && err.code === 'too_small') return 'Name is required.';
    return err.message;
  };

  // Validate a single field and update errors state
  const validateField = (name: string, value: any) => {
    let testObj = { ...form, [name]: value };
    const result = CharacterSchema.safeParse(testObj);
    if (result.success) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    } else {
      const fieldErr = result.error.errors.find(e => e.path[0] === name);
      setErrors(prev => ({ ...prev, [name]: fieldErr ? friendlyError(fieldErr) : '' }));
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setForm((f) => {
      const updated = { ...f, [name]: newValue };
      validateField(name, newValue);
      return updated;
    });
  };

  // Validate on blur for instant feedback
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    validateField(name, newValue);
  };

  // Submit add/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    // Duplicate slug/name check
    const isDuplicateSlug = characters.some(c => c.slug === form.slug && (modalMode === 'add' || (modalMode === 'edit' && c.slug !== editingCharacter?.slug)));
    const isDuplicateName = characters.some(c => c.name.trim().toLowerCase() === form.name.trim().toLowerCase() && (modalMode === 'add' || (modalMode === 'edit' && c.slug !== editingCharacter?.slug)));
    if (isDuplicateSlug) {
      setErrors(prev => ({ ...prev, slug: 'A character with this slug already exists.' }));
      setFeedback('Please fix the highlighted errors.');
      setSubmitting(false);
      return;
    }
    if (isDuplicateName) {
      setErrors(prev => ({ ...prev, name: 'A character with this name already exists.' }));
      setFeedback('Please fix the highlighted errors.');
      setSubmitting(false);
      return;
    }
    // Validate all fields before submit
    const result = CharacterSchema.safeParse(form);
    if (!result.success) {
      const newErrors: Record<string, string> = {};
      for (const err of result.error.errors) {
        const field = err.path[0] as string;
        newErrors[field] = friendlyError(err);
      }
      setErrors(newErrors);
      setFeedback('Please fix the highlighted errors.');
      setSubmitting(false);
      return;
    }
    setErrors({});
    try {
      const method = modalMode === 'add' ? 'POST' : 'PUT';
      const res = await fetch('/api/admin/characters', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to save character');
      setFeedback('Character saved successfully.');
      closeModal();
      fetchCharacters();
    } catch (err: any) {
      setFeedback(err.message || 'Error saving character');
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
      const res = await fetch('/api/admin/characters', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: deleteSlug }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete character');
      setFeedback('Character deleted.');
      setDeleteSlug(null);
      fetchCharacters();
    } catch (err: any) {
      setFeedback(err.message || 'Error deleting character');
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
      <h1 style={{ fontWeight: 700, fontSize: '2rem', marginBottom: 8, color: accent }}>Manage Characters</h1>
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
        Add Character
      </button>
      {feedback && <div style={{ margin: '1rem 0', color: feedback.toLowerCase().includes('error') ? errorColor : successColor, fontWeight: 500 }}>{feedback}</div>}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: errorColor }}>{error}</p>}
      {!loading && !error && (
        <div style={{ borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 8px #0001', background: accentLight }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '1rem' }}>
            <thead>
              <tr style={{ background: accent, color: '#fff' }}>
                <th style={{ padding: 12, borderBottom: `2px solid ${border}`, textAlign: 'left' }}>Name</th>
                <th style={{ padding: 12, borderBottom: `2px solid ${border}`, textAlign: 'left' }}>Slug</th>
                <th style={{ padding: 12, borderBottom: `2px solid ${border}`, textAlign: 'left' }}>Worlds</th>
                <th style={{ padding: 12, borderBottom: `2px solid ${border}`, textAlign: 'left' }}>Books</th>
                <th style={{ padding: 12, borderBottom: `2px solid ${border}`, textAlign: 'left' }}>Series</th>
                <th style={{ padding: 12, borderBottom: `2px solid ${border}`, textAlign: 'left' }}>Published</th>
                <th style={{ padding: 12, borderBottom: `2px solid ${border}`, textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {characters.map((c, i) => {
                // Get world titles
                const worldTitles = (c.worldSlugs || []).map(slug => {
                  const w = worlds.find(w => w.slug === slug);
                  return w ? w.title : slug;
                });
                // Get book titles
                const bookTitles = (c.appearsInBookSlugs || []).map(slug => {
                  const b = books.find(b => b.slug === slug);
                  return b ? b.title : slug;
                });
                // Get series titles
                const seriesTitles = (c.seriesSlugs || []).map(slug => {
                  const s = series.find(s => s.slug === slug);
                  return s ? s.title : slug;
                });
                return (
                  <tr
                    key={c.slug}
                    style={{
                      background: i % 2 === 0 ? '#fff' : accentLight,
                      transition: 'background 0.2s',
                    }}
                    onMouseOver={e => (e.currentTarget.style.background = '#f3f4f6')}
                    onMouseOut={e => (e.currentTarget.style.background = i % 2 === 0 ? '#fff' : accentLight)}
                  >
                    <td style={{ padding: 12 }}>{c.name}</td>
                    <td style={{ padding: 12 }}>{c.slug}</td>
                    <td style={{ padding: 12 }}>
                      {worldTitles.length > 0 ? worldTitles.map(title => (
                        <span key={title} style={{ background: '#fef9c3', color: '#92400e', borderRadius: 6, padding: '2px 8px', marginRight: 4, fontSize: 13 }}>{title}</span>
                      )) : <span style={{ color: '#bbb' }}>—</span>}
                    </td>
                    <td style={{ padding: 12 }}>
                      {bookTitles.length > 0 ? bookTitles.map(title => (
                        <span key={title} style={{ background: '#e0e7ff', color: '#3730a3', borderRadius: 6, padding: '2px 8px', marginRight: 4, fontSize: 13 }}>{title}</span>
                      )) : <span style={{ color: '#bbb' }}>—</span>}
                    </td>
                    <td style={{ padding: 12 }}>
                      {seriesTitles.length > 0 ? seriesTitles.map(title => (
                        <span key={title} style={{ background: '#f3e8ff', color: '#7c3aed', borderRadius: 6, padding: '2px 8px', marginRight: 4, fontSize: 13 }}>{title}</span>
                      )) : <span style={{ color: '#bbb' }}>—</span>}
                    </td>
                    <td style={{ padding: 12 }}>{c.published ? 'Yes' : 'No'}</td>
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
                        onClick={() => openModal('edit', c)}
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
                        onClick={() => setDeleteSlug(c.slug)}
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
            <h2 style={{ fontWeight: 700, fontSize: '1.4rem', marginBottom: 18, color: accent }}>{modalMode === 'add' ? 'Add Character' : 'Edit Character'}</h2>
            {/* Basic Info */}
            <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 18, padding: 16 }}>
              <legend style={{ fontWeight: 600, color: accent }}>Basic Info</legend>
              <label style={{ fontWeight: 500 }} htmlFor="name">Name *</label>
              <input id="name" name="name" value={form.name} onChange={handleFormChange} onBlur={handleBlur} required aria-invalid={!!errors.name} aria-describedby={errors.name ? 'name-error' : undefined} style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 4, border: `1px solid ${errors.name ? errorColor : border}` }} placeholder="e.g. Alex Fox" />
              {errors.name && <div id="name-error" style={{ color: errorColor, fontSize: 13, marginBottom: 8 }} role="alert">{errors.name}</div>}

              <label style={{ fontWeight: 500 }} htmlFor="slug">Slug *</label>
              <input id="slug" name="slug" value={form.slug} onChange={handleFormChange} onBlur={handleBlur} required disabled={modalMode === 'edit'} aria-invalid={!!errors.slug} aria-describedby={errors.slug ? 'slug-error' : undefined} style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 4, border: `1px solid ${errors.slug ? errorColor : border}` }} placeholder="e.g. alex-fox" pattern="^[a-z0-9-]+$" maxLength={64} />
              <div style={{ fontSize: 12, color: '#888' }}>Lowercase, alphanumeric, hyphens only. Example: <code>alex-fox</code></div>
              {errors.slug && <div id="slug-error" style={{ color: errorColor, fontSize: 13, marginBottom: 8 }} role="alert">{errors.slug}</div>}
            </fieldset>

            {/* Description */}
            <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 18, padding: 16 }}>
              <legend style={{ fontWeight: 600, color: accent }}>Description</legend>
              <label style={{ fontWeight: 500 }} htmlFor="description">Description</label>
              <textarea id="description" name="description" value={form.description} onChange={handleFormChange} onBlur={handleBlur} aria-invalid={!!errors.description} aria-describedby={errors.description ? 'description-error' : undefined} style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 4, border: `1px solid ${errors.description ? errorColor : border}` }} placeholder="Short summary or blurb" />
              {errors.description && <div id="description-error" style={{ color: errorColor, fontSize: 13, marginBottom: 8 }} role="alert">{errors.description}</div>}
            </fieldset>

            {/* World */}
            <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 18, padding: 16 }}>
              <legend style={{ fontWeight: 600, color: accent }}>World</legend>
              <label style={{ fontWeight: 500 }} htmlFor="world_slug">World</label>
              <select id="world_slug" name="world_slug" value={form.world_slug || ''} onChange={handleFormChange} onBlur={handleBlur} aria-invalid={!!errors.world_slug} aria-describedby={errors.world_slug ? 'world_slug-error' : undefined} style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 4, border: `1px solid ${errors.world_slug ? errorColor : border}` }}>
                <option value="">-- None --</option>
                {worlds.map(w => (
                  <option key={w.slug} value={w.slug}>{w.title} ({w.slug})</option>
                ))}
              </select>
              <div style={{ fontSize: 12, color: '#888' }}>Select the world this character belongs to (optional).</div>
              {errors.world_slug && <div id="world_slug-error" style={{ color: errorColor, fontSize: 13, marginBottom: 8 }} role="alert">{errors.world_slug}</div>}
            </fieldset>

            {/* Publication */}
            <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 18, padding: 16 }}>
              <legend style={{ fontWeight: 600, color: accent }}>Publication</legend>
              <label style={{ fontWeight: 500 }} htmlFor="published"><input id="published" type="checkbox" name="published" checked={!!form.published} onChange={handleFormChange} onBlur={handleBlur} aria-invalid={!!errors.published} aria-describedby={errors.published ? 'published-error' : undefined} style={{ marginRight: 6 }} /> Published</label>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Checked: Character is visible on the public site. Unchecked: Character is hidden (draft).</div>
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
            <p style={{ fontWeight: 500, fontSize: '1.1rem', marginBottom: 18 }}>Are you sure you want to delete this character?</p>
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
