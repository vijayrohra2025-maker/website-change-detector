const nextConfig = {
  devIndicators: false,
  outputFileTracingIncludes: {
    "/api/sites/**": ["./node_modules/playwright-core/.local-browsers/**/*"]
  }
};

export default nextConfig;
