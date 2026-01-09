// Cloudflare Pages Function: /api/worker/logout
// Clears the worker_admin session cookie

export const onRequest: PagesFunction = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Set-Cookie': 'worker_admin=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0',
    },
  });
};
