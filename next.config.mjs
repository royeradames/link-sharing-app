/** @type {import('next').NextConfig} */
const config = {
  // The accounts journey builds into its own directory so it never replaces
  // the guest build that the main browser suite runs against.
  distDir: process.env.DEVLINKS_DIST_DIR || ".next",
  // turbopackFileSystemCacheForBuild off: on October 8, 2026 Vercel restored a
  // Turbopack build cache for Todo and Markdown and shipped the previous CSS.
  experimental: { cpus: 2, turbopackFileSystemCacheForBuild: false },
}
export default config
