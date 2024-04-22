/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  env: {
    // API_BASE_URL: "http://localhost:5432",
    API_BASE_URL: "http://192.168.137.254:3001",
  },
};

module.exports = nextConfig;
