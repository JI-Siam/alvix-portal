/** Browser calls /api/* (same origin) and Next proxies to NestJS, so the HttpOnly cookie is first-party. */
module.exports = {
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${process.env.BACKEND_URL || 'http://localhost:4000'}/:path*` }];
  },
};
