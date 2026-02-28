/**
 * Automated API Test Suite — Portfolio SaaS
 * Runs checkpoint tests against the live Express server
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:4000';
let token = '';
let userId = 0;
let projectId = 0;
let passed = 0;
let failed = 0;

const TEST_EMAIL = `test_${Date.now()}@portfolio.dev`;
const TEST_PASS = 'Test@1234';

function request(method, url, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost',
      port: 4000,
      path: url,
      method,
      headers: { 'Content-Type': 'application/json', ...headers }
    };
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test(name, fn) {
  try {
    await fn();
    console.log(`   PASS: ${name}`);
    passed++;
  } catch (err) {
    console.log(`   FAIL: ${name} — ${err.message}`);
    failed++;
  }
}

function assert(cond, msg) {
  if (!cond) throw new Error(msg || 'Assertion failed');
}

async function runTests() {
  console.log('\n========================================');
  console.log('  Portfolio SaaS — Automated API Tests');
  console.log('========================================\n');

  //  CHECKPOINT 1: Health 
  console.log(' CHECKPOINT 1: Server Health');
  await test('GET /api/health returns 200', async () => {
    const r = await request('GET', '/api/health');
    assert(r.status === 200, `Expected 200 got ${r.status}`);
    assert(r.body.status === 'ok', 'Status should be ok');
  });

  //  CHECKPOINT 2: Auth 
  console.log('\n CHECKPOINT 2: Authentication');
  await test('POST /api/auth/register — creates user', async () => {
    const r = await request('POST', '/api/auth/register', { name: 'Test User', email: TEST_EMAIL, password: TEST_PASS });
    assert(r.status === 201, `Expected 201 got ${r.status}: ${JSON.stringify(r.body)}`);
    assert(r.body.token, 'Token should be present');
    assert(r.body.user.email === TEST_EMAIL, 'Email mismatch');
    token = r.body.token;
    userId = r.body.user.id;
  });

  await test('POST /api/auth/register — duplicate email returns 409', async () => {
    const r = await request('POST', '/api/auth/register', { name: 'Dup', email: TEST_EMAIL, password: TEST_PASS });
    assert(r.status === 409, `Expected 409 got ${r.status}`);
  });

  await test('POST /api/auth/login — valid credentials', async () => {
    const r = await request('POST', '/api/auth/login', { email: TEST_EMAIL, password: TEST_PASS });
    assert(r.status === 200, `Expected 200 got ${r.status}`);
    assert(r.body.token, 'Token should be present');
    token = r.body.token;
  });

  await test('POST /api/auth/login — invalid password returns 401', async () => {
    const r = await request('POST', '/api/auth/login', { email: TEST_EMAIL, password: 'wrongpass' });
    assert(r.status === 401, `Expected 401 got ${r.status}`);
  });

  await test('GET /api/auth/me — with token returns user', async () => {
    const r = await request('GET', '/api/auth/me', null, { Authorization: `Bearer ${token}` });
    assert(r.status === 200, `Expected 200 got ${r.status}`);
    assert(r.body.email === TEST_EMAIL, 'Email mismatch');
  });

  await test('GET /api/auth/me — without token returns 401', async () => {
    const r = await request('GET', '/api/auth/me');
    assert(r.status === 401, `Expected 401 got ${r.status}`);
  });

  //  CHECKPOINT 3: Projects 
  console.log('\n CHECKPOINT 3: Project CRUD');
  await test('POST /api/projects — create project (auth)', async () => {
    const r = await request('POST', '/api/projects', {
      title: 'Test Project',
      description: 'An automated test project',
      category: 'Web',
      tags: 'react,node,sqlite',
      tech_stack: 'React, Node.js, SQLite',
      status: 'published'
    }, { Authorization: `Bearer ${token}` });
    assert(r.status === 201, `Expected 201 got ${r.status}: ${JSON.stringify(r.body)}`);
    assert(r.body.id, 'Project should have an id');
    assert(r.body.title === 'Test Project', 'Title mismatch');
    projectId = r.body.id;
  });

  await test('POST /api/projects — without auth returns 401', async () => {
    const r = await request('POST', '/api/projects', { title: 'Unauth Project' });
    assert(r.status === 401, `Expected 401 got ${r.status}`);
  });

  await test('GET /api/projects — list published projects', async () => {
    const r = await request('GET', '/api/projects');
    assert(r.status === 200, `Expected 200 got ${r.status}`);
    assert(Array.isArray(r.body.projects), 'Should return projects array');
    assert(r.body.projects.length >= 1, 'Should have at least 1 project');
  });

  await test('GET /api/projects/:id — get single project', async () => {
    const r = await request('GET', `/api/projects/${projectId}`);
    assert(r.status === 200, `Expected 200 got ${r.status}`);
    assert(r.body.id === projectId, 'ID mismatch');
    assert(r.body.views >= 1, 'Views should be incremented');
  });

  await test('GET /api/projects/mine — my projects (auth)', async () => {
    const r = await request('GET', '/api/projects/mine', null, { Authorization: `Bearer ${token}` });
    assert(r.status === 200, `Expected 200 got ${r.status}`);
    assert(Array.isArray(r.body), 'Should be an array');
    assert(r.body.some(p => p.id === projectId), 'My project should be in list');
  });

  await test('PUT /api/projects/:id — update project', async () => {
    const r = await request('PUT', `/api/projects/${projectId}`, {
      title: 'Updated Project Title',
      description: 'Updated description',
      category: 'Mobile',
      tags: 'react-native,expo',
      status: 'published'
    }, { Authorization: `Bearer ${token}` });
    assert(r.status === 200, `Expected 200 got ${r.status}`);
    assert(r.body.title === 'Updated Project Title', 'Title not updated');
  });

  await test('POST /api/projects/:id/testimonials — add testimonial', async () => {
    const r = await request('POST', `/api/projects/${projectId}/testimonials`, {
      author: 'Jane Doe',
      role: 'CTO',
      content: 'Excellent work!',
      rating: 5
    });
    assert(r.status === 201, `Expected 201 got ${r.status}`);
    assert(r.body.author === 'Jane Doe', 'Author mismatch');
  });

  //  CHECKPOINT 4: Search & Filter 
  console.log('\n CHECKPOINT 4: Search & Filter');
  await test('GET /api/projects?search=Updated — search works', async () => {
    const r = await request('GET', '/api/projects?search=Updated');
    assert(r.status === 200);
    assert(r.body.projects.some(p => p.title.includes('Updated')), 'Search should find project');
  });

  await test('GET /api/projects?category=Mobile — category filter', async () => {
    const r = await request('GET', '/api/projects?category=Mobile');
    assert(r.status === 200);
    assert(r.body.projects.every(p => p.category === 'Mobile'), 'All should be Mobile');
  });

  //  CHECKPOINT 5: Delete 
  console.log('\n CHECKPOINT 5: Authorization & Cleanup');
  await test('DELETE /api/projects/:id — wrong user returns 404', async () => {
    // Create a second user
    const r2 = await request('POST', '/api/auth/register', {
      name: 'Second User',
      email: `second_${Date.now()}@test.dev`,
      password: TEST_PASS
    });
    const token2 = r2.body.token;
    const r = await request('DELETE', `/api/projects/${projectId}`, null, { Authorization: `Bearer ${token2}` });
    assert(r.status === 404, `Expected 404 got ${r.status}`);
  });

  await test('DELETE /api/projects/:id — owner can delete', async () => {
    const r = await request('DELETE', `/api/projects/${projectId}`, null, { Authorization: `Bearer ${token}` });
    assert(r.status === 200, `Expected 200 got ${r.status}`);
    assert(r.body.success === true, 'Should return success');
  });

  //  Results 
  console.log('\n========================================');
  console.log(`  Results: ${passed} passed, ${failed} failed`);
  console.log('========================================\n');

  if (failed > 0) process.exit(1);
  else process.exit(0);
}

runTests().catch((err) => {
  console.error('Test runner crashed:', err);
  process.exit(1);
});
