// Middleware to require worker admin authentication
function parseCookieHeader(cookieHeader: string): Record<string, string> {
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, item) => {
      const eqIndex = item.indexOf('=');
      if (eqIndex === -1) return acc;
      const key = item.slice(0, eqIndex).trim();
      const value = item.slice(eqIndex + 1).trim();
      acc[key] = value;
      return acc;
    }, {});
}

export async function requireWorkerAdminAuth(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = parseCookieHeader(cookieHeader);
  const isAdmin = cookies.worker_admin === '1';
  if (!isAdmin) {
    return new Response('Unauthorized', { status: 401 });
  }
  return null;
}
