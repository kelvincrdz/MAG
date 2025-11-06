const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  reactStrictMode: true,
  output: 'export',
  distDir: 'docs',
  assetPrefix: '/MAG_01/',
  basePath: '/MAG_01',
  images: {
    unoptimized: true
  }
});
