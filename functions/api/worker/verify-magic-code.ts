// Cloudflare Pages Function: /api/worker/verify-magic-code
// Verifies the magic code and sets the session cookie
// Expects POST { email: string, code: string }


export const onRequestPost: PagesFunction = async ({ request, env, cf }) => {
  const { email, code } = await request.json();
  const ip = cf?.connectingIp || request.headers.get('CF-Connecting-IP') || 'unknown';
  if (!email || !code) {
    // Audit log: missing fields
    console.log(`[AUTH] [${new Date().toISOString()}] [${ip}] Missing email or code`);
    return new Response(JSON.stringify({ error: 'Missing email or code' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // Brute-force protection: limit to 10 attempts per 10 min per IP
  const rateKey = `magic-verify:${ip}`;
  const count = parseInt((await env.RATE_LIMIT.get(rateKey)) || '0', 10);
  if (count >= 10) {
    console.log(`[AUTH] [${new Date().toISOString()}] [${ip}] Rate limit exceeded for verify: ${email}`);
    return new Response(JSON.stringify({ error: 'Too many attempts, try again later.' }), { status: 429, headers: { 'Content-Type': 'application/json' } });
  }
  await env.RATE_LIMIT.put(rateKey, (count + 1).toString(), { expirationTtl: 600 });

  // Retrieve code and expiry from KV
  const stored = await env.MAGIC_CODES.get(`magic:${email}`);
  if (!stored) {
    console.log(`[AUTH] [${new Date().toISOString()}] [${ip}] Code expired or not found for: ${email}`);
    return new Response(JSON.stringify({ error: 'Code expired or not found' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }
  const { code: realCode, expires } = JSON.parse(stored);
  if (Date.now() > expires) {
    await env.MAGIC_CODES.delete(`magic:${email}`);
    console.log(`[AUTH] [${new Date().toISOString()}] [${ip}] Code expired for: ${email}`);
    return new Response(JSON.stringify({ error: 'Code expired' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }
  if (code !== realCode) {
    console.log(`[AUTH] [${new Date().toISOString()}] [${ip}] Invalid code for: ${email}`);
    return new Response(JSON.stringify({ error: 'Invalid code' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }

  // Single-use: delete code after successful login
  await env.MAGIC_CODES.delete(`magic:${email}`);

  // Audit log: successful login
  console.log(`[AUTH] [${new Date().toISOString()}] [${ip}] Successful login for: ${email}`);

  // Set session cookie (1 hour expiry)
  return new Response(null, {
    status: 200,
    headers: {
      'Set-Cookie': `worker_admin=1; Path=/; HttpOnly; SameSite=Strict; Max-Age=3600`,
    },
  });
};
