import type { NextConfig } from 'next';

const isVercel = Boolean(process.env.VERCEL);
const nextConfig: NextConfig = {
  turbopack: isVercel
    ? {
        root: process.cwd(),
        resolveAlias: {
          'cloudflare:workers': './lib/cloudflare-workers-vercel-shim.ts',
        },
      }
    : { root: process.cwd() },
};

export default nextConfig;