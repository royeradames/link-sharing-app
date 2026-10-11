/** @type {import('next').NextConfig} */
const config = {
  // The accounts journey builds into its own directory so it never replaces
  // the guest build that the main browser suite runs against.
  distDir: process.env.DEVLINKS_DIST_DIR || ".next",
  // turbopackFileSystemCacheForBuild off: on October 8, 2026 Vercel restored a
  // Turbopack build cache for Todo and Markdown and shipped the previous CSS.
  experimental: { cpus: 2, turbopackFileSystemCacheForBuild: false },
  // Sign-in and sign-up happen on the Breakthrough account (Account → Sign in
  // with Breakthrough). The old routes answer with an HTTP redirect, so no
  // sign-in page ever paints, signed in or not (pitfall SI1). A page-level
  // redirect() was prerendered as a 200 document that redirected afterwards.
  async redirects() {
    return [
      { source: "/login", destination: "/", permanent: false },
      { source: "/create-account", destination: "/", permanent: false },
    ]
  },
}
export default config
