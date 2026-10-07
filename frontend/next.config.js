const fs = require('fs');
let backendUrl = 'http://localhost:4000';
try {
  const env = fs.readFileSync('.env', 'utf8');
  const match = env.match(/^BACKEND_URL=(.*)$/m);
  if (match) backendUrl = match[1].trim();
} catch (e) {}

/** Browser calls /api/* (same origin) and Next proxies to NestJS, so the HttpOnly cookie is first-party. */
module.exports = {
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${process.env.BACKEND_URL || backendUrl}/:path*` }];
  },
};
