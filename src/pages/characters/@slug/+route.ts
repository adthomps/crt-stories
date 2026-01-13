export { route };

function route(pageContext: { urlPathname: string }) {
  if (
    pageContext.urlPathname.startsWith('/characters/') &&
    !pageContext.urlPathname.endsWith('/bio')
  ) {
    const slug = pageContext.urlPathname.slice('/characters/'.length);
    return { routeParams: { slug } };
  }
  return false;
}
