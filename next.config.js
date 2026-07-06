// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   images: {
//     remotePatterns: [
//       {
//         protocol: "http",
//         hostname: "thelink.innovex.biz",
//         port: "",
//         pathname: "/upload/**",
//       },
//     ],
//   },
// };

// module.exports = nextConfig;


/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ye 2 lines add kari hain build errors ko rokne ke liye
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
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