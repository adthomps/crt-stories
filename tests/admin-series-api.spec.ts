import { expect, test } from '@playwright/test';

const API_URL = process.env.API_URL || 'http://localhost:8788/api/admin/series';
const ADMIN_JWT = process.env.ADMIN_JWT || 'test-jwt';

function authHeaders() {
  return { 'Cf-Access-Jwt-Assertion': ADMIN_JWT, 'Content-Type': 'application/json' };
}

test.describe('Admin Series API', () => {
  let slug = `test-series-${Date.now()}`;

  test('POST /series - create', async ({ request }) => {
    const res = await request.post(API_URL, {
      headers: authHeaders(),
      data: {
        slug,
        title: 'Test Series',
        description: 'A test series',
        published: true,
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test('POST /series - duplicate slug', async ({ request }) => {
    const res = await request.post(API_URL, {
      headers: authHeaders(),
      data: {
        slug,
        title: 'Test Series',
      },
    });
    expect(res.status()).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/Slug already exists/);
  });

  test('GET /series?slug=... - fetch single', async ({ request }) => {
    const res = await request.get(`${API_URL}?slug=${slug}`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.slug).toBe(slug);
    expect(body.title).toBe('Test Series');
  });

  test('GET /series - list all', async ({ request }) => {
    const res = await request.get(API_URL, { headers: authHeaders() });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.find((s: any) => s.slug === slug)).toBeTruthy();
  });

  test('PUT /series - update', async ({ request }) => {
    const res = await request.put(API_URL, {
      headers: authHeaders(),
      data: {
        slug,
        title: 'Updated Series',
        published: false,
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test('GET /series?slug=... - verify update', async ({ request }) => {
    const res = await request.get(`${API_URL}?slug=${slug}`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.title).toBe('Updated Series');
    expect(body.published).toBe(0); // false
  });

  test('DELETE /series - soft delete', async ({ request }) => {
    const res = await request.delete(API_URL, {
      headers: authHeaders(),
      data: { slug },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test('GET /series?slug=... - after delete', async ({ request }) => {
    const res = await request.get(`${API_URL}?slug=${slug}`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(404);
  });

  test('PUT /series - update non-existent', async ({ request }) => {
    const res = await request.put(API_URL, {
      headers: authHeaders(),
      data: {
        slug: 'non-existent',
        title: 'Should Fail',
      },
    });
    expect(res.status()).toBe(404);
  });

  test('DELETE /series - delete non-existent', async ({ request }) => {
    const res = await request.delete(API_URL, {
      headers: authHeaders(),
      data: { slug: 'non-existent' },
    });
    expect(res.status()).toBe(404);
  });

  test('POST /series - validation error', async ({ request }) => {
    const res = await request.post(API_URL, {
      headers: authHeaders(),
      data: { title: '' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/Validation failed/);
  });

  test('Unauthorized access', async ({ request }) => {
    const res = await request.get(API_URL);
    expect(res.status()).toBe(401);
  });
});
