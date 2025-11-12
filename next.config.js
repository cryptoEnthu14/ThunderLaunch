/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep tracing scoped to this project even if additional lockfiles exist higher up
  outputFileTracingRoot: __dirname,
};

module.exports = nextConfig
