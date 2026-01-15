import React, { useEffect, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import ReactMarkdown from "react-markdown";

export default function CharacterBioPage() {
  const pageContext = usePageContext();
  const { slug } = pageContext.routeParams;
  const [bioMarkdown, setBioMarkdown] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/bios/${slug}.md`)
      .then((r) => {
        if (!r.ok) throw new Error("Bio not found");
        return r.text();
      })
      .then((bioMd) => setBioMarkdown(bioMd))
      .catch((e) => setError(e.message || "Failed to load bio"))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div>Loading bio...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: "2rem" }}>
      <h1>Narrative Bio</h1>
      <div
        style={{
          background: "#fafafa",
          border: "1px solid #eee",
          borderRadius: 12,
          padding: 14,
        }}
      >
        <ReactMarkdown>{bioMarkdown}</ReactMarkdown>
      </div>
    </div>
  );
}
