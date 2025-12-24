export { Head };

import React from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import { getWorldBySlug } from '../../../content';

function Head() {
  const pageContext = usePageContext();
  const { slug } = pageContext.routeParams;
  const world = getWorldBySlug(slug);

  if (!world) {
    return (
      <>
        <title>World Not Found | Author Name</title>
      </>
    );
  }

  return (
    <>
      <title>{world.title} | Author Name</title>
      <meta name="description" content={world.description} />
      <meta property="og:title" content={world.title} />
      <meta property="og:description" content={world.description} />
      <meta property="og:image" content={world.image} />
    </>
  );
}
