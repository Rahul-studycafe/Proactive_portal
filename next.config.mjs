/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/portal",
        destination: "/",
      },
      {
        source: "/portal/:path*",
        destination: "/:path*",
      },
    ];
  },
};

export default nextConfig;

