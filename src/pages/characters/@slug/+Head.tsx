export { Head };

import React from 'react';
import { usePageContext } from 'vike-react/usePageContext';
import { getCharacterBySlug } from '../../../content';

function Head() {
  const pageContext = usePageContext();
  const { slug } = pageContext.routeParams;
  const character = getCharacterBySlug(slug);



  if (!character) {
    return (
      <>
        <title>Character Not Found | Author Name</title>

      </>
    );
  }

  return (
    <>
      <title>{character.name} | Author Name</title>
      <meta name="description" content={`${character.title} - ${character.description}`} />
      <meta property="og:title" content={character.name} />
      <meta property="og:description" content={character.description} />
      <meta property="og:image" content={character.image} />