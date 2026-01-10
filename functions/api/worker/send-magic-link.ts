// Cloudflare Pages Function: /api/worker/send-magic-link
// Sends a magic login link to the provided email using Cloudflare Email Workers
// Expects POST { email: string }


export const onRequestPost: PagesFunction = async ({ request, env, cf }) => {
  const { email } = await request.json();
  const ip = cf?.connectingIp || request.headers.get('CF-Connecting-IP') || 'unknown';
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    // Audit log: invalid email
    console.log(`[AUTH] [${new Date().toISOString()}] [${ip}] Invalid email: ${email}`);
    return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  // Admin email allowlist (comma-separated in env.ADMIN_EMAILS)
  const allowed = (env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
  if (!allowed.includes(email.toLowerCase())) {
    console.log(`[AUTH] [${new Date().toISOString()}] [${ip}] Email not allowed: ${email}`);
    return new Response(JSON.stringify({ error: 'Not authorized' }), { status: 403, headers: { 'Content-Type': 'application/json' } });
  }

  // Brute-force protection: limit to 5 requests per 10 min per IP
    const rateKey = `magic-req:${ip}`;
    const count = parseInt((await env.RATE_LIMIT.get(rateKey)) || '0', 10);
    if (count >= 5) {
      console.log(`[AUTH] [${new Date().toISOString()}] [${ip}] Rate limit exceeded for email: ${email}`);
      return new Response(JSON.stringify({ error: 'Too many requests, try again later.' }), { status: 429, headers: { 'Content-Type': 'application/json' } });
    }
    await env.RATE_LIMIT.put(rateKey, (count + 1).toString(), { expirationTtl: 600 });

  // Generate a one-time code (6 digits) and expiry (10 min)
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expires = Date.now() + 10 * 60 * 1000;

  // Store code and expiry in KV (single-use)
    await env.MAGIC_CODES.put(`magic:${email}`, JSON.stringify({ code, expires }), { expirationTtl: 600 });

  // Compose email
  const subject = 'Your CRT Stories Admin Login Code';
  const body = `Your one-time login code is: ${code}\n\nThis code expires in 10 minutes.`;

  // Send email using Cloudflare Worker
  const sendResult = await fetch('https://send-mgaic-link-email.apt-account.workers.dev/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });

  if (!sendResult.ok) {
    // Audit log: failed email send
    const errorText = await sendResult.text();
    console.log(`[AUTH] [${new Date().toISOString()}] [${ip}] Failed to send code to: ${email}`);
    console.log(`[AUTH] [${new Date().toISOString()}] [${ip}] MailChannels error: ${errorText}`);
    return new Response(JSON.stringify({ error: 'Failed to send email', details: errorText }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  // Audit log: successful code send
  console.log(`[AUTH] [${new Date().toISOString()}] [${ip}] Sent code to: ${email}`);

  // For demo: return code in response (remove in production)
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
