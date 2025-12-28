

export const onRequest: PagesFunction = async (context) => {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const slug = url.pathname.split('/').filter(Boolean).pop();
    if (!slug) {
      return new Response(JSON.stringify({ error: 'Missing slug' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    const result = await env.CRT_STORIES_CONTENT.prepare(
      "UPDATE worlds SET published = 1, updated_at = datetime('now') WHERE slug = ? AND deleted_at IS NULL"
    ).bind(slug).run();
    if (result.changes === 0) {
      return new Response(JSON.stringify({ error: 'Not found or already deleted' }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    await env.CRT_STORIES_CONTENT.prepare(
      "UPDATE export_state SET needs_export = 1, updated_at = datetime('now') WHERE id = 1"
    ).run();
    // Optionally, remove audit log or set admin_email to NULL or a placeholder
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Worlds publish API error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error', details: err instanceof Error ? err.message : String(err), stack: err instanceof Error ? err.stack : undefined }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
