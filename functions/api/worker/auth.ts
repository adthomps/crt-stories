// Simple password authentication for worker admin
// In production, use environment variables and secure storage for secrets
export const onRequestPost = async ({ request }: { request: Request }) => {
  const { password } = await request.json();
  const ADMIN_PASSWORD = process.env.WORKER_ADMIN_PASSWORD || 'changeme';
  if (password === ADMIN_PASSWORD) {
    // Set a simple session cookie (for demo only)
    return new Response(null, {
      status: 200,
      headers: {
        'Set-Cookie': `worker_admin=1; Path=/; HttpOnly; SameSite=Strict`,
      },
    });
  }
  return new Response('Unauthorized', { status: 401 });
};
