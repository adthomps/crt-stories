export { route };

function route(pageContext: { urlPathname: string }) {
  if (pageContext.urlPathname.startsWith('/worlds/')) {
    const slug = pageContext.urlPathname.slice('/worlds/'.length);
    return { routeParams: { slug } };
  }
  return false;
}
