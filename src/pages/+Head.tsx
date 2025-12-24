export { Head };

import React from 'react';
import { siteConfig } from '../config';

interface HeadProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

function Head({ title, description, image, url }: HeadProps) {
  const pageTitle = title ? `${title} | ${siteConfig.title}` : siteConfig.title;
  const metaDescription = description || siteConfig.description;
  const defaultImage = '/og-image.jpg';
  const metaImage = image || defaultImage;
  const metaUrl = url ? `${siteConfig.baseUrl}${url}` : siteConfig.baseUrl;

  return (
    <>
      <title>{pageTitle}</title>
      <meta name="description" content={metaDescription} />
      
      {/* Open Graph */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={metaUrl} />
      <meta property="og:type" content="website" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={metaImage} />
      
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="icon" href="/favicon.ico" />
    </>
  );
}
