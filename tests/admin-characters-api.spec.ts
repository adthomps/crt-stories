import { expect, test } from '@playwright/test';

const API_URL = process.env.API_URL_CHARACTERS || 'http://localhost:3000/api/admin/characters';
const ADMIN_JWT = process.env.ADMIN_JWT || 'test-jwt';

function authHeaders() {
  return { 'Cf-Access-Jwt-Assertion': ADMIN_JWT, 'Content-Type': 'application/json' };
}

test.describe('Admin Characters API', () => {
  let slug = `test-character-${Date.now()}`;

  test('POST /characters - create', async ({ request }) => {
    const res = await request.post(API_URL, {
      headers: authHeaders(),
      data: {
        slug,
        name: 'Test Character',
        description: 'A test character',
        published: true,
      },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test('POST /characters - duplicate slug', async ({ request }) => {
    const res = await request.post(API_URL, {
      headers: authHeaders(),
      data: {
        slug,
        name: 'Test Character',
      },
    });
    expect(res.status()).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/Slug already exists/);
  });

  test('GET /characters?slug=... - fetch single', async ({ request }) => {
    const res = await request.get(`${API_URL}?slug=${slug}`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.slug).toBe(slug);
    expect(body.name).toBe('Test Character');
  });

  test('GET /characters - list all', async ({ request }) => {
    const res = await request.get(API_URL, { headers: authHeaders() });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body)).toBe(true);
    expect(body.find((c: any) => c.slug === slug)).toBeTruthy();
  });

  test('PUT /characters - update', async ({ request }) => {
    const res = await request.put(API_URL, {
      headers: authHeaders(),
      data: {
        slug,
        name: 'Updated Character',
        published: false,
      },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test('GET /characters?slug=... - verify update', async ({ request }) => {
    const res = await request.get(`${API_URL}?slug=${slug}`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.name).toBe('Updated Character');
    expect(body.published).toBe(0); // false
  });

  test('DELETE /characters - soft delete', async ({ request }) => {
    const res = await request.delete(API_URL, {
      headers: authHeaders(),
      data: { slug },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test('GET /characters?slug=... - after delete', async ({ request }) => {
    const res = await request.get(`${API_URL}?slug=${slug}`, {
      headers: authHeaders(),
    });
    expect(res.status()).toBe(404);
  });

  test('PUT /characters - update non-existent', async ({ request }) => {
    const res = await request.put(API_URL, {
      headers: authHeaders(),
      data: {
        slug: 'non-existent',
        name: 'Should Fail',
      },
    });
    expect(res.status()).toBe(404);
  });

  test('DELETE /characters - delete non-existent', async ({ request }) => {
    const res = await request.delete(API_URL, {
      headers: authHeaders(),
      data: { slug: 'non-existent' },
    });
    expect(res.status()).toBe(404);
  });

  test('POST /characters - validation error', async ({ request }) => {
    const res = await request.post(API_URL, {
      headers: authHeaders(),
      data: { name: '' },
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
