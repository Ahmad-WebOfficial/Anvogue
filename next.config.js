/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "thelink.innovex.biz",
        port: "",
        pathname: "/upload/**",
      },
    ],
  },
};

module.exports = nextConfig;
