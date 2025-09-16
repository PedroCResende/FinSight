import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ADICIONE A LINHA ABAIXO
  allowedDevOrigins: ['https://3001-firebase-studio-1757367968101.cluster-f73ibkkuije66wssuontdtbx6q.cloudworkstations.dev'],

  /* O resto da sua configuração continua igual */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;