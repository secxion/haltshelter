#!/usr/bin/env node
const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

// use global fetch on Node 18+; fail fast if not available
const fetch = global.fetch;
if (!fetch) {
  console.error('Global fetch is not available in this Node runtime. Please run on Node 18+ or install node-fetch.');
  process.exit(1);
}

const API_BASE = process.env.API_URL || `http://localhost:${process.env.PORT || 5000}/api`;

async function wait(ms){return new Promise(r=>setTimeout(r,ms));}

async function run() {
  let serverProcess = null;
  try {
    // Helper: fetch with retries
    async function fetchWithRetry(url, opts = {}, retries = 5, delayMs = 1000) {
      let lastErr;
      for (let i = 0; i < retries; i++) {
        try {
          const res = await fetch(url, opts);
          return res;
        } catch (err) {
          lastErr = err;
          await wait(delayMs);
        }
      }
      throw lastErr;
    }

    // Check health; if not responding, start local server and wait (with retries)
    let healthy = false;
    try {
      const res = await fetchWithRetry(`${API_BASE}/health`, {}, 2, 500);
      healthy = res && res.ok;
    } catch (err) {
      // start server
      console.log('Server not responding; starting local server...');
      serverProcess = spawn(process.execPath, [path.join(__dirname, '../app.js')], { stdio: 'inherit' });
      // wait and poll health for up to ~12s
      for (let i = 0; i < 12; i++) {
        try {
          const res = await fetch(`${API_BASE}/health`);
          if (res.ok) { healthy = true; break; }
        } catch (e) {
          // ignore and wait
        }
        await wait(1000);
      }
    }

    if (!healthy) throw new Error('Server did not become healthy after starting');

    // Create a test blog directly via API (admin route requires admin key)
    const now = Date.now();
    const testBlog = {
      title: `smoke-test-${now}`,
      excerpt: 'smoke test',
      content: 'smoke test',
      category: 'announcements',
      status: 'published'
    };

    // Determine admin key: prefer server/admin-key.json, then env, then test legacy
    const fs = require('fs');
    const serverAdminKeyPath = path.join(__dirname, '../admin-key.json');
    let adminKeyToUse = process.env.ADMIN_KEY || 'test123';
    try {
      if (fs.existsSync(serverAdminKeyPath)) {
        const data = JSON.parse(fs.readFileSync(serverAdminKeyPath, 'utf8'));
        if (data && data.adminKey) adminKeyToUse = data.adminKey;
      }
    } catch (e) {
      // ignore
    }

    // Login as admin using legacy key (non-production mode)
    let loginJson;
    try {
      const loginResp = await fetchWithRetry(`${API_BASE}/admin-auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminKey: adminKeyToUse })
      }, 3, 500);
      loginJson = await loginResp.json();
    } catch (err) {
      // try alternate admin auth route
      const altResp = await fetchWithRetry(`${API_BASE}/auth/admin-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminKey: adminKeyToUse })
      }, 2, 500);
      loginJson = await altResp.json();
    }

    if (!loginJson || !loginJson.token) {
      console.error('Admin login failed, response:', loginJson);
      throw new Error('Admin login failed');
    }
    const token = loginJson.token;

    // Create blog
    const createResp = await fetch(`${API_BASE}/blog`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(testBlog)
    });
    const createJson = await createResp.json();
    if (!createJson.success) throw new Error('Failed to create blog');
    const blogId = createJson.data._id;
    console.log('Created blog', blogId);

    // Toggle like (anonymous) - send X-Forwarded-For for consistent ipHash
    const likeResp = await fetch(`${API_BASE}/blog/${blogId}/like`, {
      method: 'POST',
      headers: { 'X-Forwarded-For': '127.0.0.1' }
    });
    const likeJson = await likeResp.json();
    console.log('Like response:', likeJson);

    // Toggle unlike
    const unlikeResp = await fetch(`${API_BASE}/blog/${blogId}/like`, { method: 'POST', headers: { 'X-Forwarded-For': '127.0.0.1' } });
    const unlikeJson = await unlikeResp.json();
    console.log('Unlike response:', unlikeJson);

    // Recompute likes via admin endpoint
    const recomputeResp = await fetch(`${API_BASE}/blog/admin/recompute-likes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    });
    let recomputeJson;
    const ct = recomputeResp.headers.get('content-type') || '';
    if (ct.includes('application/json')) {
      recomputeJson = await recomputeResp.json();
      console.log('Recompute response (json):', recomputeJson);
    } else {
      const text = await recomputeResp.text();
      console.warn('Recompute endpoint returned non-JSON. Status:', recomputeResp.status, recomputeResp.statusText);
      console.warn('Recompute body (text):', text.slice(0, 2000));
      recomputeJson = { nonJsonBody: text, status: recomputeResp.status };
    }

    // Clean up: delete the blog
    const delResp = await fetch(`${API_BASE}/blog/${blogId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const delJson = await delResp.json();
    console.log('Deleted blog:', delJson);

    console.log('HTTP smoke tests completed successfully');
  } catch (err) {
    console.error('HTTP smoke tests failed:', err.message || err);
    process.exitCode = 2;
  } finally {
    if (typeof serverProcess?.kill === 'function') {
      try { serverProcess.kill(); } catch (e) { /* ignore */ }
    }
  }
}

run();
