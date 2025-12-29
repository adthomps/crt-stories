
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
  world_slug?: string;
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

  // Modal form state
  const [form, setForm] = useState<Character>({ slug: '', name: '', description: '', world_slug: '', published: false });
  // Dropdown data for worlds
  const [worlds, setWorlds] = useState<{ slug: string; title: string }[]>([]);
  // Load worlds for dropdown
  useEffect(() => {
    fetch('/src/content/worlds.json')
      .then(res => res.json())
      .then(data => setWorlds(data.map((w: any) => ({ slug: w.slug, title: w.title }))));
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

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm((f) => ({ ...f, [name]: (e.target as HTMLInputElement).checked }));
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
                <th style={{ padding: 12, borderBottom: `2px solid ${border}`, textAlign: 'left' }}>World Slug</th>
                <th style={{ padding: 12, borderBottom: `2px solid ${border}`, textAlign: 'left' }}>Published</th>
                <th style={{ padding: 12, borderBottom: `2px solid ${border}`, textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {characters.map((c, i) => (
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
                  <td style={{ padding: 12 }}>{c.world_slug}</td>
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
              ))}
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
              <label style={{ fontWeight: 500 }}>Name
                <input name="name" value={form.name} onChange={handleFormChange} required style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 4, border: `1px solid ${border}` }} placeholder="e.g. Alex Fox" />
              </label>
              <label style={{ fontWeight: 500 }}>Slug
                <input name="slug" value={form.slug} onChange={handleFormChange} required disabled={modalMode === 'edit'} style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 4, border: `1px solid ${border}` }} placeholder="e.g. alex-fox" pattern="^[a-z0-9-]+$" maxLength={64} />
                <div style={{ fontSize: 12, color: '#888' }}>Lowercase, alphanumeric, hyphens only. Example: <code>alex-fox</code></div>
              </label>
            </fieldset>

            {/* Description */}
            <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 18, padding: 16 }}>
              <legend style={{ fontWeight: 600, color: accent }}>Description</legend>
              <label style={{ fontWeight: 500 }}>Description
                <textarea name="description" value={form.description} onChange={handleFormChange} style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 4, border: `1px solid ${border}` }} placeholder="Short summary or blurb" />
              </label>
            </fieldset>

            {/* World */}
            <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 18, padding: 16 }}>
              <legend style={{ fontWeight: 600, color: accent }}>World</legend>
              <label style={{ fontWeight: 500 }}>World
                <select name="world_slug" value={form.world_slug || ''} onChange={handleFormChange} style={{ width: '100%', marginTop: 4, padding: 6, borderRadius: 4, border: `1px solid ${border}` }}>
                  <option value="">-- None --</option>
                  {worlds.map(w => (
                    <option key={w.slug} value={w.slug}>{w.title} ({w.slug})</option>
                  ))}
                </select>
                <div style={{ fontSize: 12, color: '#888' }}>Select the world this character belongs to (optional).</div>
              </label>
            </fieldset>

            {/* Publication */}
            <fieldset style={{ border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 18, padding: 16 }}>
              <legend style={{ fontWeight: 600, color: accent }}>Publication</legend>
              <label style={{ fontWeight: 500 }}><input type="checkbox" name="published" checked={!!form.published} onChange={handleFormChange} style={{ marginRight: 6 }} /> Published
                <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Checked: Character is visible on the public site. Unchecked: Character is hidden (draft).</div>
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
