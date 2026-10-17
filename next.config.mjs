/** @type {import('next').NextConfig} */
const config = {
  // turbopackFileSystemCacheForBuild off: on October 8, 2026 Vercel restored a
  // Turbopack build cache for Todo and Markdown and shipped the previous CSS.
  experimental: { inlineCss: true, cpus: 2, turbopackFileSystemCacheForBuild: false },
  // This solution has no sign-in. The design's Login and Create Account
  // routes answer with an HTTP redirect to the welcome page, so no sign-in
  // page ever paints (pitfall SI1). A page-level redirect() was prerendered
  // as a 200 document that redirected afterwards.
  async redirects() {
    return [
      { source: "/login", destination: "/", permanent: false },
      { source: "/create-account", destination: "/", permanent: false },
    ]
  },
}
export default config
