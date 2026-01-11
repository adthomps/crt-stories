import React, { useState, useEffect } from "react";

function BackToWorker() {
  return (
    <div style={{ marginBottom: 24 }}>
      <a
        href="/worker/dashboard"
        style={{
          color: "#1976d2",
          textDecoration: "none",
          fontWeight: 500,
          fontSize: "1.1rem",
        }}
      >
        &larr; Back to Worker Dashboard
      </a>
    </div>
  );
}

interface Series {
  slug: string;
  title: string;
  description?: string;
  published?: boolean;
}

export default function WorkerSeriesPage() {
  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showCount, setShowCount] = useState(20); // Pagination

  const fetchSeries = () => {
    setLoading(true);
    fetch("/api/worker/series", {
      headers: { Accept: "application/json" },
      credentials: "include",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to fetch series");
        return res.json();
      })
      .then(setSeries)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };
  useEffect(fetchSeries, []);

  const [form, setForm] = useState<Series>({
    slug: "",
    title: "",
    description: "",
    published: false,
  });

  const openModal = (mode: "add" | "edit", s?: Series) => {
    setModalMode(mode);
    setEditingSeries(s || null);
    setForm(
      s ? { ...s } : { slug: "", title: "", description: "", published: false }
    );
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditingSeries(null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);
    try {
      const method = modalMode === "add" ? "POST" : "PUT";
      const res = await fetch("/api/worker/series", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save series");
      setFeedback("Series saved successfully.");
      closeModal();
      fetchSeries();
    } catch (err: any) {
      setFeedback(err.message || "Error saving series");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteSlug) return;
    setSubmitting(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/worker/series", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: deleteSlug }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete series");
      setFeedback("Series deleted.");
      setDeleteSlug(null);
      fetchSeries();
    } catch (err: any) {
      setFeedback(err.message || "Error deleting series");
    } finally {
      setSubmitting(false);
    }
  };

  const accent = "#222b3a";
  const accentLight = "#e6eaf1";
  const border = "#d1d5db";
  const errorColor = "#b91c1c";
  const successColor = "#15803d";

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "2rem auto",
        padding: "2rem",
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 4px 24px #0002",
        fontFamily: "inherit",
      }}
    >
      <BackToWorker />
      <h1
        style={{
          fontWeight: 700,
          fontSize: "2rem",
          marginBottom: 8,
          color: accent,
        }}
      >
        Manage Series
      </h1>
      <button
        style={{
          marginBottom: 20,
          background: accent,
          color: "#fff",
          border: "none",
          borderRadius: 6,
          padding: "8px 20px",
          fontWeight: 600,
          fontSize: "1rem",
          cursor: "pointer",
          boxShadow: "0 1px 4px #0001",
          transition: "background 0.2s",
        }}
        onClick={() => openModal("add")}
        onMouseOver={(e) => (e.currentTarget.style.background = "#1a2230")}
        onMouseOut={(e) => (e.currentTarget.style.background = accent)}
      >
        Add Series
      </button>
      {feedback && (
        <div
          style={{
            margin: "1rem 0",
            color: feedback.toLowerCase().includes("error")
              ? errorColor
              : successColor,
            fontWeight: 500,
          }}
        >
          {feedback}
        </div>
      )}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: errorColor }}>{error}</p>}
      {!loading && !error && (
        <div
          style={{
            borderRadius: 12,
            overflow: "hidden",
            boxShadow: "0 1px 8px #0001",
            background: accentLight,
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "1rem",
            }}
          >
            <thead>
              <tr style={{ background: accent, color: "#fff" }}>
                <th
                  style={{
                    padding: 12,
                    borderBottom: `2px solid ${border}`,
                    textAlign: "left",
                  }}
                >
                  Title
                </th>
                <th
                  style={{
                    padding: 12,
                    borderBottom: `2px solid ${border}`,
                    textAlign: "left",
                  }}
                >
                  Slug
                </th>
                <th
                  style={{
                    padding: 12,
                    borderBottom: `2px solid ${border}`,
                    textAlign: "left",
                  }}
                >
                  Published
                </th>
                <th
                  style={{
                    padding: 12,
                    borderBottom: `2px solid ${border}`,
                    textAlign: "left",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {series.slice(0, showCount).map((s, i) => (
                <tr
                  key={s.slug}
                  style={{
                    background: i % 2 === 0 ? "#fff" : accentLight,
                    transition: "background 0.2s",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "#f3f4f6")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background =
                      i % 2 === 0 ? "#fff" : accentLight)
                  }
                >
                  <td style={{ padding: 12 }}>{s.title}</td>
                  <td style={{ padding: 12 }}>{s.slug}</td>
                  <td style={{ padding: 12 }}>{s.published ? "Yes" : "No"}</td>
                  <td style={{ padding: 12 }}>
                    <button
                      style={{
                        marginRight: 8,
                        background: accent,
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        padding: "4px 14px",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onClick={() => openModal("edit", s)}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background = "#1a2230")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.background = accent)
                      }
                    >
                      Edit
                    </button>
                    <button
                      style={{
                        background: errorColor,
                        color: "#fff",
                        border: "none",
                        borderRadius: 4,
                        padding: "4px 14px",
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onClick={() => setDeleteSlug(s.slug)}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.background = "#991b1b")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.background = errorColor)
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {series.length > showCount && (
        <div style={{ textAlign: "center", margin: "1.5rem 0" }}>
          <button
            style={{
              background: accent,
              color: "#fff",
              border: "none",
              borderRadius: 6,
              padding: "10px 28px",
              fontWeight: 700,
              fontSize: "1.1rem",
              cursor: "pointer",
              boxShadow: "0 1px 4px #0001",
              transition: "background 0.2s",
              outline: "none",
              letterSpacing: 0.5,
            }}
            onClick={() => setShowCount((c) => c + 20)}
          >
            Show More
          </button>
        </div>
      )}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "#0008",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              background: "#fff",
              padding: 36,
              borderRadius: 14,
              minWidth: 350,
              maxWidth: 500,
              boxShadow: "0 4px 24px #0003",
              position: "relative",
              fontFamily: "inherit",
            }}
          >
            <h2
              style={{
                fontWeight: 700,
                fontSize: "1.4rem",
                marginBottom: 18,
                color: accent,
              }}
            >
              {modalMode === "add" ? "Add Series" : "Edit Series"}
            </h2>
            <fieldset
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                marginBottom: 18,
                padding: 16,
              }}
            >
              <legend style={{ fontWeight: 600, color: accent }}>
                Basic Info
              </legend>
              <label style={{ fontWeight: 500 }}>
                Title
                <input
                  name="title"
                  value={form.title}
                  onChange={handleFormChange}
                  required
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: 6,
                    borderRadius: 4,
                    border: `1px solid ${border}`,
                  }}
                  placeholder="e.g. Power Seven"
                />
              </label>
              <label style={{ fontWeight: 500 }}>
                Slug
                <input
                  name="slug"
                  value={form.slug}
                  onChange={handleFormChange}
                  required
                  disabled={modalMode === "edit"}
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: 6,
                    borderRadius: 4,
                    border: `1px solid ${border}`,
                  }}
                  placeholder="e.g. power-seven"
                  pattern="^[a-z0-9-]+$"
                  maxLength={64}
                />
                <div style={{ fontSize: 12, color: "#888" }}>
                  Lowercase, alphanumeric, hyphens only. Example:{" "}
                  <code>power-seven</code>
                </div>
              </label>
            </fieldset>
            <fieldset
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                marginBottom: 18,
                padding: 16,
              }}
            >
              <legend style={{ fontWeight: 600, color: accent }}>
                Description
              </legend>
              <label style={{ fontWeight: 500 }}>
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleFormChange}
                  style={{
                    width: "100%",
                    marginTop: 4,
                    padding: 6,
                    borderRadius: 4,
                    border: `1px solid ${border}`,
                  }}
                  placeholder="Short summary or blurb"
                />
              </label>
            </fieldset>
            <fieldset
              style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                marginBottom: 18,
                padding: 16,
              }}
            >
              <legend style={{ fontWeight: 600, color: accent }}>
                Publication
              </legend>
              <label style={{ fontWeight: 500 }}>
                <input
                  type="checkbox"
                  name="published"
                  checked={!!form.published}
                  onChange={handleFormChange}
                  style={{ marginRight: 6 }}
                />{" "}
                Published
                <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                  Checked: Series is visible on the public site. Unchecked:
                  Series is hidden (draft).
                </div>
              </label>
            </fieldset>
            <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  background: accent,
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 20px",
                  fontWeight: 600,
                  fontSize: "1rem",
                  cursor: "pointer",
                  boxShadow: "0 1px 4px #0001",
                  transition: "background 0.2s",
                }}
              >
                {submitting ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  background: "#fff",
                  color: accent,
                  border: `1px solid ${border}`,
                  borderRadius: 6,
                  padding: "8px 20px",
                  fontWeight: 600,
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                Cancel
              </button>
            </div>
            {feedback && (
              <div style={{ color: errorColor, marginTop: 12 }}>{feedback}</div>
            )}
          </form>
        </div>
      )}
      {deleteSlug && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "#0008",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: 36,
              borderRadius: 14,
              minWidth: 300,
              boxShadow: "0 4px 24px #0003",
              textAlign: "center",
              fontFamily: "inherit",
            }}
          >
            <p
              style={{ fontWeight: 500, fontSize: "1.1rem", marginBottom: 18 }}
            >
              Are you sure you want to delete this series?
            </p>
            <div
              style={{
                marginTop: 16,
                display: "flex",
                gap: 12,
                justifyContent: "center",
              }}
            >
              <button
                onClick={handleDelete}
                disabled={submitting}
                style={{
                  background: errorColor,
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 20px",
                  fontWeight: 600,
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                {submitting ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setDeleteSlug(null)}
                style={{
                  background: "#fff",
                  color: accent,
                  border: `1px solid ${border}`,
                  borderRadius: 6,
                  padding: "8px 20px",
                  fontWeight: 600,
                  fontSize: "1rem",
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
