const http = require('http');
const fs = require('fs');
const path = require('path');
const { build } = require('./build-assets');
const server = require('../server');

const TEST_PORT = 3099;
const BASE_URL = `http://localhost:${TEST_PORT}`;

function httpRequest(urlPath, headers = {}) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(urlPath, BASE_URL);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname,
        method: 'GET',
        headers
      },
      res => {
        let body = '';
        res.on('data', chunk => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body
          });
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ Assertion failed: ${message}`);
    process.exit(1);
  }
  console.log(`  ✓ ${message}`);
}

async function runTests() {
  console.log('🧪 Starting Cache Invalidation Automated Verification Tests...\n');

  // Step 0: Ensure clean build
  build();

  // Start test server
  await new Promise(resolve => server.listen(TEST_PORT, resolve));
  console.log(`Server listening on port ${TEST_PORT}\n`);

  try {
    // -------------------------------------------------------------
    // Test 1: Initial HTML Request (Normal user visit)
    // -------------------------------------------------------------
    console.log('Test 1: Initial HTML request cache headers');
    const htmlRes1 = await httpRequest('/index.html');
    assert(htmlRes1.statusCode === 200, 'HTML returns 200 OK on first visit');
    assert(
      htmlRes1.headers['cache-control'] &&
        htmlRes1.headers['cache-control'].includes('max-age=0') &&
        htmlRes1.headers['cache-control'].includes('must-revalidate'),
      `HTML Cache-Control is "${htmlRes1.headers['cache-control']}" (must-revalidate on navigation)`
    );
    assert(!!htmlRes1.headers['etag'], `HTML returns ETag: ${htmlRes1.headers['etag']}`);
    const initialEtag = htmlRes1.headers['etag'];

    // Extract hashed CSS link from HTML
    const cssMatch = htmlRes1.body.match(/href="([^"]*assets\/dist\/app\.[a-f0-9]+\.css)"/);
    assert(!!cssMatch, `HTML references content-hashed CSS: ${cssMatch ? cssMatch[1] : 'NOT FOUND'}`);
    const initialCssPath = '/' + cssMatch[1].replace(/^\//, '');

    // Extract hashed JS link from HTML
    const jsMatch = htmlRes1.body.match(/src="([^"]*assets\/dist\/app\.[a-f0-9]+\.js)"/);
    assert(!!jsMatch, `HTML references content-hashed JS: ${jsMatch ? jsMatch[1] : 'NOT FOUND'}`);
    const initialJsPath = '/' + jsMatch[1].replace(/^\//, '');

    // Extract hashed Logo link from HTML
    const logoMatch = htmlRes1.body.match(/src="([^"]*assets\/dist\/logo\.[a-f0-9]+\.png)"/);
    assert(!!logoMatch, `HTML references content-hashed logo: ${logoMatch ? logoMatch[1] : 'NOT FOUND'}`);
    const initialLogoPath = '/' + logoMatch[1].replace(/^\//, '');

    // -------------------------------------------------------------
    // Test 2: Hashed Static Assets Caching (Immutable 1-Year Cache)
    // -------------------------------------------------------------
    console.log('\nTest 2: Hashed static assets cache headers');
    const cssRes = await httpRequest(initialCssPath);
    assert(cssRes.statusCode === 200, `Hashed CSS returns 200 OK: ${initialCssPath}`);
    assert(
      cssRes.headers['cache-control'] &&
        cssRes.headers['cache-control'].includes('max-age=31536000') &&
        cssRes.headers['cache-control'].includes('immutable'),
      `Hashed CSS Cache-Control is immutable: "${cssRes.headers['cache-control']}"`
    );

    const jsRes = await httpRequest(initialJsPath);
    assert(jsRes.statusCode === 200, `Hashed JS returns 200 OK: ${initialJsPath}`);
    assert(
      jsRes.headers['cache-control'] &&
        jsRes.headers['cache-control'].includes('max-age=31536000') &&
        jsRes.headers['cache-control'].includes('immutable'),
      `Hashed JS Cache-Control is immutable: "${jsRes.headers['cache-control']}"`
    );

    const logoRes = await httpRequest(initialLogoPath);
    assert(logoRes.statusCode === 200, `Hashed Logo returns 200 OK: ${initialLogoPath}`);
    assert(
      logoRes.headers['cache-control'] &&
        logoRes.headers['cache-control'].includes('max-age=31536000') &&
        logoRes.headers['cache-control'].includes('immutable'),
      `Hashed Logo Cache-Control is immutable: "${logoRes.headers['cache-control']}"`
    );

    // -------------------------------------------------------------
    // Test 3: Unchanged Page Revalidation (HTTP 304 Not Modified)
    // -------------------------------------------------------------
    console.log('\nTest 3: Browser conditional revalidation when nothing changed');
    const revalRes = await httpRequest('/index.html', { 'if-none-match': initialEtag });
    assert(revalRes.statusCode === 304, 'Server returns 304 Not Modified for unchanged HTML');
    assert(!revalRes.body, '304 response body is empty (zero network payload)');

    // -------------------------------------------------------------
    // Test 4: Deploying a Change & Automatic Cache Invalidation
    // -------------------------------------------------------------
    console.log('\nTest 4: Deploying a change and testing automatic cache invalidation (No Ctrl+F5)');
    const cssFilePath = path.join(__dirname, '../assets/css/app.css');
    const originalCssContent = fs.readFileSync(cssFilePath, 'utf8');

    // Simulate code change by appending a deployment test comment
    const deployTimestamp = Date.now();
    const modifiedCssContent = `${originalCssContent}\n/* Deployment Change Timestamp: ${deployTimestamp} */\n`;
    fs.writeFileSync(cssFilePath, modifiedCssContent, 'utf8');

    // Simulate production build / deployment
    build();

    // Browser navigates to page in normal session with previous If-None-Match
    const htmlRes2 = await httpRequest('/index.html', { 'if-none-match': initialEtag });
    assert(htmlRes2.statusCode === 200, 'Server returns fresh 200 OK after deployment');
    assert(htmlRes2.headers['etag'] !== initialEtag, `ETag changed from ${initialEtag} -> ${htmlRes2.headers['etag']}`);

    // Extract the new CSS URL
    const newCssMatch = htmlRes2.body.match(/href="([^"]*assets\/dist\/app\.[a-f0-9]+\.css)"/);
    assert(!!newCssMatch, `New HTML references updated hashed CSS: ${newCssMatch[1]}`);
    const newCssPath = '/' + newCssMatch[1].replace(/^\//, '');
    assert(newCssPath !== initialCssPath, `CSS hash changed from ${initialCssPath} to ${newCssPath}`);

    // Fetch the new CSS asset
    const newCssRes = await httpRequest(newCssPath);
    assert(newCssRes.statusCode === 200, 'New CSS asset loads successfully');
    assert(newCssRes.body.includes(`Deployment Change Timestamp: ${deployTimestamp}`), 'New CSS contains deployed changes');
    assert(
      newCssRes.headers['cache-control'] && newCssRes.headers['cache-control'].includes('immutable'),
      'New CSS asset has immutable caching'
    );

    // Revert the temporary CSS change and rebuild cleanly
    fs.writeFileSync(cssFilePath, originalCssContent, 'utf8');
    build();
    console.log('\n  ✓ Cleaned up test modifications and rebuilt assets.');

    console.log('\n🎉 ALL CACHE INVALIDATION TESTS PASSED SUCCESSFULLY!\n');
  } catch (err) {
    console.error('Test execution failed:', err);
    process.exit(1);
  } finally {
    server.close();
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
