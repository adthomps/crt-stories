import { expect, test } from '@playwright/test';

const API_URL = process.env.API_URL_WORLDS || 'http://localhost:3000/api/admin/worlds';
const ADMIN_JWT = process.env.ADMIN_JWT || 'test-jwt';

function authHeaders() {
  return { 'Cf-Access-Jwt-Assertion': ADMIN_JWT, 'Content-Type': 'application/json' };
}

test.describe('Admin Worlds API', () => {
  let slug = `test-world-${Date.now()}`;

  test('POST /worlds - create', async ({ request }) => {
    const res = await request.post(API_URL, {
      headers: authHeaders(),
      data: {
        slug,
        title: 'Test World',
        description: 'A test world',
        published: true,
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test('POST /worlds - duplicate slug', async ({ request }) => {
    const res = await request.post(API_URL, {
      headers: authHeaders(),
      data: {
        slug,
        title: 'Test World',
      },
    });
    expect(res.status()).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/Slug already exists/);
  });

  test('GET /worlds?slug=... - fetch single', async ({ request }) => {
    const res = await request.get(`${API_URL}?slug=${slug}`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.slug).toBe(slug);
    expect(body.title).toBe('Test World');
  });

  test('GET /worlds - list all', async ({ request }) => {
    const res = await request.get(API_URL, { headers: authHeaders() });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.find((w: any) => w.slug === slug)).toBeTruthy();
  });

  test('PUT /worlds - update', async ({ request }) => {
    const res = await request.put(API_URL, {
      headers: authHeaders(),
      data: {
        slug,
        title: 'Updated World',
        published: false,
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test('GET /worlds?slug=... - verify update', async ({ request }) => {
    const res = await request.get(`${API_URL}?slug=${slug}`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.title).toBe('Updated World');
    expect(body.published).toBe(0); // false
  });

  test('DELETE /worlds - soft delete', async ({ request }) => {
    const res = await request.delete(API_URL, {
      headers: authHeaders(),
      data: { slug },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test('GET /worlds?slug=... - after delete', async ({ request }) => {
    const res = await request.get(`${API_URL}?slug=${slug}`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(404);
  });

  test('PUT /worlds - update non-existent', async ({ request }) => {
    const res = await request.put(API_URL, {
      headers: authHeaders(),
      data: {
        slug: 'non-existent',
        title: 'Should Fail',
      },
    });
    expect(res.status()).toBe(404);
  });

  test('DELETE /worlds - delete non-existent', async ({ request }) => {
    const res = await request.delete(API_URL, {
      headers: authHeaders(),
      data: { slug: 'non-existent' },
    });
    expect(res.status()).toBe(404);
  });

  test('POST /worlds - validation error', async ({ request }) => {
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
