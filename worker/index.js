export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', { status: 405 });
    }
    try {
      const { email, code } = await request.json();
      const subject = 'Your CRT Stories Admin Login Code';
      const body = `Your one-time login code is: ${code}\n\nThis code expires in 10 minutes.`;

      // Mailgun API endpoint
      const mailgunUrl = `https://api.mailgun.net/v3/${env.MAILGUN_DOMAIN}/messages`;

      // Mailgun requires form data
      const formData = new URLSearchParams();
      formData.append('from', env.ADMIN_EMAIL_FROM);
      formData.append('to', email);
      formData.append('subject', subject);
      formData.append('text', body);

      const sendResult = await fetch(mailgunUrl, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa('api:' + env.MAILGUN_API_KEY),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData.toString(),
      });

      if (!sendResult.ok) {
        const errorText = await sendResult.text();
        return new Response(JSON.stringify({ error: 'Failed to send email', details: errorText }), { status: 500, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    } catch (err) {
      return new Response(JSON.stringify({ error: 'Bad request', details: err.message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  }
}
