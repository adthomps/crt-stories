import React, { useEffect, useState } from "react";
import { usePageContext } from "vike-react/usePageContext";


function Page() {
  const pageContext = usePageContext();
  const { slug } = pageContext.routeParams;
  const [character, setCharacter] = useState<any | null>(null);

  const [relatedWorlds, setRelatedWorlds] = useState<any[]>([]);
  const [relatedBooks, setRelatedBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

@@ -24,10 +26,14 @@ function Page() {
      fetch("/api/worker/books", {
        headers: { Accept: "application/json" },
      }).then((r) => r.json()),



    ])
      .then(([charData, worldsData, booksData]) => {
        if (!charData || charData.error) throw new Error("Character not found");
        setCharacter(charData);

        // Find related worlds
        const worldSlugs = Array.isArray(charData.worldSlugs)
          ? charData.worldSlugs

@@ -51,10 +57,18 @@ function Page() {
  if (error || !character)
    return <div style={{ color: "red" }}>{error || "Character not found"}</div>;







  return (
    <>
      <div className="detail-header">
        <h1 className="page-title">{character.name}</h1>


        {character.badges && character.badges.length > 0 && (
          <div className="badge-list">
            {character.badges.map((badge: any, i: number) => (

@@ -69,23 +83,34 @@ function Page() {
          character.roleTag.length > 0 && (
            <p className="page-description">{character.roleTag.join(" · ")}</p>
          )}





      </div>

      <div className="detail-content character-detail-flex">
        <div className="character-portrait-col">
          <img
            src={character.portraitImage}
            alt={character.name}
            className="detail-image character-detail-portrait"
          />


        </div>
        <div className="character-info-col">
          {character.bio && (
            <div className="section">
              <h2>About</h2>
              <p>{character.bio}</p>
            </div>
          )}





          {character.audioExcerpt && (
            <div className="section">