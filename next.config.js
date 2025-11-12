const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

// Determina ambiente de execução
const isVercel = process.env.VERCEL === '1';
const isDev = process.env.NODE_ENV !== 'production';
// Nome do repositório quando publicar em GitHub Pages (ajuste conforme necessário)
const repoName = 'MAG_01';

module.exports = withPWA({
  reactStrictMode: true,
  output: 'export',
  distDir: 'docs',
  // Em desenvolvimento local, NÃO utilizar basePath/assetPrefix para evitar 404 em '/'
  // Em produção (build/export) fora do Vercel, aplica basePath para GitHub Pages
  assetPrefix: !isVercel && !isDev ? `/${repoName}/` : undefined,
  basePath: !isVercel && !isDev ? `/${repoName}` : undefined,
  images: {
    unoptimized: true
  }
});
