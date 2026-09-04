const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DIR = path.resolve(__dirname, '..');
const ASSETS_DIR = path.join(ROOT_DIR, 'assets');
const DIST_DIR = path.join(ASSETS_DIR, 'dist');

// Compute 8-char SHA-256 hash of file content
function getFileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex').slice(0, 8);
}

function build() {
  console.log('🚀 [Vistaraz Cache Invalidator] Building content-hashed assets...');

  // Ensure assets/dist exists
  if (!fs.existsSync(DIST_DIR)) {
    fs.mkdirSync(DIST_DIR, { recursive: true });
  }

  // Clean old files in assets/dist
  const oldDistFiles = fs.readdirSync(DIST_DIR);
  for (const file of oldDistFiles) {
    fs.unlinkSync(path.join(DIST_DIR, file));
  }

  const manifest = {};
  const assetMappings = [];

  // 1. Process CSS assets
  const cssDir = path.join(ASSETS_DIR, 'css');
  if (fs.existsSync(cssDir)) {
    const cssFiles = fs.readdirSync(cssDir).filter(f => f.endsWith('.css'));
    for (const file of cssFiles) {
      const srcPath = path.join(cssDir, file);
      const hash = getFileHash(srcPath);
      const ext = path.extname(file);
      const base = path.basename(file, ext);
      const hashedName = `${base}.${hash}${ext}`;
      const destPath = path.join(DIST_DIR, hashedName);

      fs.copyFileSync(srcPath, destPath);
      // Also write unhashed alias in dist for local fallback resilience
      fs.copyFileSync(srcPath, path.join(DIST_DIR, file));
      const originalRel = `assets/css/${file}`;
      const hashedRel = `assets/dist/${hashedName}`;
      manifest[originalRel] = hashedRel;
      manifest[`assets/dist/${file}`] = hashedRel;
      assetMappings.push({
        type: 'css',
        baseName: base,
        original: originalRel,
        hashed: hashedRel,
        hash
      });
      console.log(`  ✓ CSS: ${originalRel} -> ${hashedRel}`);
    }
  }

  // 2. Process JS assets
  const jsDir = path.join(ASSETS_DIR, 'js');
  if (fs.existsSync(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir).filter(f => f.endsWith('.js'));
    for (const file of jsFiles) {
      const srcPath = path.join(jsDir, file);
      const hash = getFileHash(srcPath);
      const ext = path.extname(file);
      const base = path.basename(file, ext);
      const hashedName = `${base}.${hash}${ext}`;
      const destPath = path.join(DIST_DIR, hashedName);

      fs.copyFileSync(srcPath, destPath);
      // Also write unhashed alias in dist for local fallback resilience
      fs.copyFileSync(srcPath, path.join(DIST_DIR, file));
      const originalRel = `assets/js/${file}`;
      const hashedRel = `assets/dist/${hashedName}`;
      manifest[originalRel] = hashedRel;
      manifest[`assets/dist/${file}`] = hashedRel;
      assetMappings.push({
        type: 'js',
        baseName: base,
        original: originalRel,
        hashed: hashedRel,
        hash
      });
      console.log(`  ✓ JS:  ${originalRel} -> ${hashedRel}`);
    }
  }

  // 3. Process Logo & Image assets
  const logoPath = path.join(ASSETS_DIR, 'logo.png');
  if (fs.existsSync(logoPath)) {
    const hash = getFileHash(logoPath);
    const hashedName = `logo.${hash}.png`;
    const destPath = path.join(DIST_DIR, hashedName);
    fs.copyFileSync(logoPath, destPath);
    const hashedRel = `assets/dist/${hashedName}`;
    manifest['assets/logo.png'] = hashedRel;
    manifest['assets/logo.svg'] = hashedRel; // Fallback mapping for any legacy svg references
    assetMappings.push({
      type: 'img',
      baseName: 'logo',
      original: 'assets/logo.png',
      hashed: hashedRel,
      hash
    });
    console.log(`  ✓ IMG: assets/logo.png -> ${hashedRel}`);
  }

  // Write manifest.json
  const manifestPath = path.join(DIST_DIR, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
  console.log(`  ✓ Created manifest at assets/dist/manifest.json`);

  // 4. Update all HTML files in project root
  const htmlFiles = fs.readdirSync(ROOT_DIR).filter(f => f.endsWith('.html'));
  console.log(`\n📄 Updating ${htmlFiles.length} HTML files with content-hashed assets & cache meta tags...`);

  for (const htmlFile of htmlFiles) {
    const htmlPath = path.join(ROOT_DIR, htmlFile);
    let content = fs.readFileSync(htmlPath, 'utf8');

    // Replace CSS links (matches both original assets/css/app.css and previously hashed assets/dist/app.*.css)
    content = content.replace(
      /href=["'](?:assets\/css\/app\.css|assets\/dist\/app\.[a-f0-9]+\.css)["']/g,
      `href="${manifest['assets/css/app.css'] || 'assets/css/app.css'}"`
    );

    // Replace JS scripts (matches both original assets/js/app.js and previously hashed assets/dist/app.*.js)
    content = content.replace(
      /src=["'](?:assets\/js\/app\.js|assets\/dist\/app\.[a-f0-9]+\.js)["']/g,
      `src="${manifest['assets/js/app.js'] || 'assets/js/app.js'}"`
    );

    // Replace API JS script (formerly supabase.js)
    content = content.replace(
      /src=["'](?:assets\/js\/api\.js|assets\/dist\/api\.[a-f0-9]+\.js|assets\/js\/supabase\.js|assets\/dist\/supabase\.[a-f0-9]+\.js)["']/g,
      `src="${manifest['assets/js/api.js'] || 'assets/js/api.js'}"`
    );

    // Replace Tools JS script
    content = content.replace(
      /src=["'](?:assets\/js\/tools\.js|assets\/dist\/tools\.[a-f0-9]+\.js)["']/g,
      `src="${manifest['assets/js/tools.js'] || 'assets/js/tools.js'}"`
    );

    // Replace Logo images (matches assets/logo.png, assets/logo.svg, and assets/dist/logo.*.png)
    content = content.replace(
      /src=["'](?:assets\/logo\.png|assets\/logo\.svg|assets\/dist\/logo\.[a-f0-9]+\.png)["']/g,
      `src="${manifest['assets/logo.png'] || 'assets/logo.png'}"`
    );

    // Add HTTP Cache Control meta tags in <head> if not already present
    const metaCacheTag = `<meta http-equiv="Cache-Control" content="no-cache, must-revalidate">\n  <meta http-equiv="Pragma" content="no-cache">`;
    if (!content.includes('http-equiv="Cache-Control"')) {
      if (content.includes('<meta name="viewport"')) {
        content = content.replace(
          /(<meta name="viewport"[^>]*>)/i,
          `$1\n  ${metaCacheTag}`
        );
      } else if (content.includes('<head>')) {
        content = content.replace(/<head>/i, `<head>\n  ${metaCacheTag}`);
      }
    }

    fs.writeFileSync(htmlPath, content, 'utf8');
    console.log(`  ✓ Updated ${htmlFile}`);
  }

  console.log('\n✨ Cache invalidation build complete! All HTML files point to fresh hashed assets.\n');
  return manifest;
}

if (require.main === module) {
  build();
}

module.exports = { build, getFileHash };
