const http = require('http');
const fs = require('fs');
const path = require('path');
const server = require('../server');

const TEST_PORT = 3456;

function request(pathStr) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:${TEST_PORT}${pathStr}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('🧪 Running Vistaraz Error Handling & Resilience Test Suite...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  const srv = server.listen(TEST_PORT);

  try {
    // Test 1: 404 page returned on missing route
    const res404 = await request('/missing-sanctuary-page-xyz');
    assert(res404.statusCode === 404, 'Missing route returns HTTP 404 status code');
    assert(res404.headers['content-type'].includes('text/html'), '404 response has Content-Type text/html');
    assert(res404.body.includes('404 · PATH NOT FOUND'), '404 HTML includes "404 · PATH NOT FOUND" heading');
    assert(res404.body.includes('assets/dist/app.') || res404.body.includes('app.css'), '404 HTML references app CSS');

    // Test 2: 200 OK for homepage
    const resHome = await request('/');
    assert(resHome.statusCode === 200, 'Home route returns HTTP 200');
    assert(resHome.headers['content-type'].includes('text/html'), 'Home response is text/html');

    // Test 3: 500.html exists and is valid
    const path500 = path.join(__dirname, '..', '500.html');
    assert(fs.existsSync(path500), '500.html exists on disk');
    const content500 = fs.readFileSync(path500, 'utf8');
    assert(content500.includes('TEMPORARY PAUSE · 500 SERVER REST'), '500.html contains friendly sanctuary messaging');
    assert(content500.includes('statusBadge') && content500.includes('handleRetry'), '500.html contains retry and connectivity status mechanisms');

    // Test 4: CSS contains resilience classes
    const distDir = path.join(__dirname, '..', 'assets', 'dist');
    const cssFiles = fs.readdirSync(distDir).filter(f => f.startsWith('app.') && f.endsWith('.css'));
    assert(cssFiles.length > 0, 'Hashed app CSS exists in assets/dist');
    const cssContent = fs.readFileSync(path.join(distDir, cssFiles[0]), 'utf8');
    assert(cssContent.includes('.vz-skeleton'), 'CSS contains .vz-skeleton class');
    assert(cssContent.includes('.vz-top-progress'), 'CSS contains .vz-top-progress class');
    assert(cssContent.includes('.vz-error-boundary'), 'CSS contains .vz-error-boundary class');
    assert(cssContent.includes('.vz-network-toast'), 'CSS contains .vz-network-toast class');
    assert(cssContent.includes('.vz-retry-card'), 'CSS contains .vz-retry-card class');

    // Test 5: JS contains resilience tools
    const jsFiles = fs.readdirSync(distDir).filter(f => f.startsWith('app.') && f.endsWith('.js'));
    assert(jsFiles.length > 0, 'Hashed app JS exists in assets/dist');
    const jsContent = fs.readFileSync(path.join(distDir, jsFiles[0]), 'utf8');
    assert(jsContent.includes('VzErrorBoundary'), 'JS contains VzErrorBoundary');
    assert(jsContent.includes('VzLoading'), 'JS contains VzLoading');
    assert(jsContent.includes('VzNetwork'), 'JS contains VzNetwork');
    assert(jsContent.includes('VzRetry'), 'JS contains VzRetry');

    // Test 6: API contains error normalization and retry
    const apiFiles = fs.readdirSync(distDir).filter(f => f.startsWith('api.') && f.endsWith('.js'));
    assert(apiFiles.length > 0, 'Hashed api JS exists in assets/dist');
    const apiContent = fs.readFileSync(path.join(distDir, apiFiles[0]), 'utf8');
    assert(apiContent.includes('normalizeApiError'), 'API JS contains normalizeApiError');
    assert(apiContent.includes('executeResilient'), 'API JS contains executeResilient');

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
  } catch (err) {
    console.error('Test run failed unexpectedly:', err);
    failed++;
  } finally {
    srv.close();
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests();
