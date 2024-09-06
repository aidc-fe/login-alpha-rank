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
  env: {
    NEXT_PUBLIC_VERCEL_ENV: process.env.VERCEL_ENV,
    NEXT_PUBLIC_SHOPIFY_CLIENT_ID: process.env.SHOPIFY_CLIENT_ID,
    NEXT_PUBLIC_DEFAULT_TARGET_URL: process.env.DEFAULT_TARGET_URL,
    NEXT_PUBLIC_NEXT_AUTH_URL: process.env.NEXT_AUTH_URL,
    NEXT_PUBLIC_THIRD_PARTY_SIGNIN_API: process.env.THIRD_PARTY_SIGNIN_API,
    NEXT_PUBLIC_THIRD_PARTY_SIGNOUT_API: process.env.THIRD_PARTY_SIGNOUT_API,
    NEXT_PUBLIC_TARGET_HOST_WHITE_LIST: process.env.TARGET_HOST_WHITE_LIST,
    NEXT_PUBLIC_WEBSITE_DOMAIN: process.env.WEBSITE_DOMAIN,
  },
};

export default nextConfig;
