
// ...existing code...
// ...existing code...
import author from '../../content/author.json';

function Page() {
  return (
    <div className="about-author-page">
      <h1 className="page-title">About the Author</h1>
      <div className="about-author-flex">
        <div className="about-author-portrait-col">
          <img src={author.portraitImage} alt={author.name} className="about-author-portrait" />
        </div>
        <div className="about-author-info-col">
          <h2 className="about-author-name">{author.name}</h2>
          {author.portraitCaption && (
            <div className="about-author-caption">{author.portraitCaption}</div>
          )}
          {author.bio && Array.isArray(author.bio) && author.bio.map((para, i) => (
            <p className="about-author-bio" key={i}>{para}</p>
          ))}
          {author.themes && author.themes.length > 0 && (
            <div className="about-author-themes">
              <strong>Themes:</strong>
              <ul>
                {author.themes.map((theme, i) => (
                  <li key={i}>{theme}</li>
                ))}
              </ul>
            </div>
          )}
          {author.links && author.links.amazonAuthor && author.links.amazonAuthor !== 'TBD' && (
            <div className="about-author-links">
              <a href={author.links.amazonAuthor} className="button" target="_blank" rel="noopener noreferrer">
                Amazon Author Page
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;
