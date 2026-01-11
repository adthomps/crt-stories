// Middleware to require worker admin authentication
export async function requireWorkerAdminAuth(request: Request) {
  const cookie = request.headers.get('cookie') || '';
  const isAdmin = /worker_admin=1/.test(cookie);
  if (!isAdmin) {
    return new Response('Unauthorized', { status: 401 });
  }
  return null;
}
