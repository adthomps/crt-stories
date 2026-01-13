// Character Bio experimental view
import React, { useEffect, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";
import ReactMarkdown from "react-markdown";

export default function Page() {
  const pageContext = usePageContext();
  const { slug } = pageContext.routeParams;
  const [bioMarkdown, setBioMarkdown] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetch(`/bios/${slug}.md`)
      .then((r) => (r.ok ? r.text() : null))
      .then((md) => setBioMarkdown(md))
      .catch(() => setError("Bio not found"));
  }, [slug]);

  if (error) return <div style={{ color: "red" }}>{error}</div>;
  if (!bioMarkdown) return <div>Loading bio...</div>;
  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: 32 }}>
      <h1>Character Bio</h1>
      <ReactMarkdown>{bioMarkdown}</ReactMarkdown>
    </div>
  );
}
