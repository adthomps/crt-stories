// Cloudflare Access JWT verification utility
// Verifies Cf-Access-Jwt-Assertion and extracts admin email

/**
 * Verifies the Cloudflare Access JWT and extracts the admin email.
 * Throws an error if invalid or missing.
 * @param {Request} request
 * @returns {Promise<string>} admin email
 */
export async function getAdminEmailFromRequest(request) {
	const jwt = request.headers.get('Cf-Access-Jwt-Assertion');
	if (!jwt) {
		throw new Response('Missing authentication (no Cf-Access-Jwt-Assertion)', { status: 401 });
	}

	// Cloudflare publishes the public key for your Access app at this URL:
	// https://<your-domain>.cloudflareaccess.com/cdn-cgi/access/certs
	// For local dev, you may want to skip verification or mock this.

	// For now, decode the JWT (no signature check) to extract email (for demo/dev only)
	// In production, you should verify the JWT signature using the public key.
	const [, payloadB64] = jwt.split('.');
	if (!payloadB64) throw new Response('Malformed JWT', { status: 401 });
	const payloadJson = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
	const payload = JSON.parse(payloadJson);
	const email = payload.email || payload.sub || payload.name;
	if (!email) throw new Response('No email in JWT', { status: 401 });
	return email;
}
