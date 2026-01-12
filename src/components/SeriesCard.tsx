import React from "react";

export function SeriesCard({
  series,
  firstBook,
}: {
  series: any;
  firstBook?: any;
}) {
  return (
    <div className="card series-card">
      <img
        src={firstBook?.coverImage || series.heroImage}
        alt={series.title}
        className="card-image series-card-image"
      />
      <div className="card-content">
        <h3 className="card-title">{series.title}</h3>
        <p className="card-description">{series.description}</p>
        <a href={`/series/${series.slug}`} className="button">
          View Series
        </a>
      </div>
    </div>
  );
}
