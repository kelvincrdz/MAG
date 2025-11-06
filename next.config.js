const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

// Determina se estamos no Vercel ou GitHub Pages
const isVercel = process.env.VERCEL === '1';
const repoName = 'MAG_01';

module.exports = withPWA({
  reactStrictMode: true,
  output: 'export',
  distDir: 'docs',
  // Só aplica assetPrefix e basePath se não estiver no Vercel
  assetPrefix: isVercel ? undefined : `/${repoName}/`,
  basePath: isVercel ? undefined : `/${repoName}`,
  images: {
    unoptimized: true
  }
});
