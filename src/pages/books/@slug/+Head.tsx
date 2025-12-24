export { Head };

import React from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import { getBookBySlug } from '../../../content';

function Head() {
  const pageContext = usePageContext();
  const { slug } = pageContext.routeParams;
  const book = getBookBySlug(slug);

  if (!book) {
    return (
      <>
        <title>Book Not Found | Author Name</title>
      </>
    );
  }

  return (
    <>
      <title>{book.title} | Author Name</title>
      <meta name="description" content={book.description} />
      <meta property="og:title" content={book.title} />
      <meta property="og:description" content={book.description} />
      <meta property="og:image" content={book.coverImage} />
    </>
  );
}
