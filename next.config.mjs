/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "img.icons8.com",
      },
      {
        protocol: "https",
        hostname: "img.alicdn.com",
      },
      { protocol: "https", hostname: "authjs.dev" },
    ],
  },
};

export default nextConfig;
