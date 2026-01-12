import React from "react";

export function BookCard({ book }: { book: any }) {
  // Truncate description for summary view
  const expanded =
    book.description && book.description.length > 317
      ? book.description.slice(0, 317) + "..."
      : book.description || "";

  return (
    <div className="card book-card">
      <img
        src={book.coverImage}
        alt={book.title}
        className="card-image book-card-image"
      />
      <div className="card-content">
        <h3 className="card-title">{book.title}</h3>
        <p className="card-description">{expanded}</p>
        <a href={`/books/${book.slug}`} className="button">
          Learn More
        </a>
      </div>
    </div>
  );
}
