import React from "react";

export function WorldCard({ world }: { world: any }) {
  return (
    <div className="card world-card">
      {world.heroImage && (
        <img
          src={world.heroImage}
          alt={world.title}
          className="card-image world-card-image"
        />
      )}
      <div className="card-content">
        <h3 className="card-title">{world.title}</h3>
        <p className="card-description">{world.description}</p>
        <a href={`/worlds/${world.slug}`} className="button">
          Explore
        </a>
      </div>
    </div>
  );
}
