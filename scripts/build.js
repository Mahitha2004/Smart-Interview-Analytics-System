const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

async function build() {
  const publicScriptPath = path.resolve(__dirname, '../frontend/public/script.js');
  const distDir = path.resolve(__dirname, '../dist');
  const publicDir = path.resolve(__dirname, '../frontend/public');

  // Bundle React code into frontend/public/script.js
  await esbuild.build({
    entryPoints: [path.resolve(__dirname, '../frontend/src/index.jsx')],
    bundle: true,
    outfile: publicScriptPath,
    loader: { '.js': 'jsx', '.jsx': 'jsx' },
  });

  // Replicate static assets to dist/ for zero-config Vercel deployment
  fs.mkdirSync(distDir, { recursive: true });
  const files = fs.readdirSync(publicDir);
  for (const file of files) {
    const srcPath = path.join(publicDir, file);
    const destPath = path.join(distDir, file);
    fs.copyFileSync(srcPath, destPath);
  }

  console.log('Build completed successfully. Artifacts ready in frontend/public and dist/.');
}

build().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
