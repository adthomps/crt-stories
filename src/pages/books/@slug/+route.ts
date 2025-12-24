export { route };

function route(pageContext: { urlPathname: string }) {
  if (pageContext.urlPathname.startsWith('/books/')) {
    const slug = pageContext.urlPathname.slice('/books/'.length);
    return { routeParams: { slug } };
  }
  return false;
}
