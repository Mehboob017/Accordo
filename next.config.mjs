import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const pdfFiles = [
  "Annual_Requirement_Hindi.pdf",
  "Annual_Requirement_English.pdf",
];

/** @type {import("next").NextConfig} */
const nextConfig = {

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self';",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          }
        ],
      },
      {
        source: '/.well-known/apple-app-site-association',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
      },
      {
        source: '/.well-known/assetlinks.json',
        headers: [{ key: 'Content-Type', value: 'application/json' }],
      },
      ...pdfFiles.map((file) => ({
        source: `/assets/uploads/${file}`,
        headers: [
          {
            key: "Link",
            value: `<https://www.sdlindia.com/assets/uploads/${file}>; rel="canonical"`,
          },
        ],
      })),
    ];
  },

  async rewrites() {
    return [
      {
        source: "/",
        destination: "/theme/paris",
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/product/:path*',
        destination: '/products/:path*',
        permanent: true,
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.sdlindia.com",
        pathname: "/**",
      },
    ],
    formats: ['image/webp', 'image/avif'],
    qualities: [75, 85, 95, 100],
    minimumCacheTTL: 86400, // 1 day
    // minimumCacheTTL: 2678400, // 31 days
  },

  htmlLimitedBots: /.*/,
};

export default withBundleAnalyzer(nextConfig);