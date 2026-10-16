const nextConfig = {
  devIndicators: false,
  outputFileTracingIncludes: {
    "/api/sites/**": ["./node_modules/@sparticuz/chromium/bin/**/*"]
  }
};

export default nextConfig;
