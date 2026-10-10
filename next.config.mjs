/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    const base = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      {
        key: 'Content-Security-Policy-Report-Only',
        value:
          "default-src 'self'; img-src 'self' data: blob: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-src https://www.youtube-nocookie.com https://player.vimeo.com; connect-src 'self'",
      },
    ]
    return [
      { source: '/:path*', headers: base },
      // The admin area is authenticated and state-changing, so block framing there.
      { source: '/admin/:path*', headers: [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }] },
    ]
  },
}

export default nextConfig
