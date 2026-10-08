/** @type {import('next').NextConfig} */
export default {
  // The accounts journey builds into its own directory so it never replaces
  // the guest build that the main browser suite runs against.
  distDir: process.env.DEVLINKS_DIST_DIR || ".next",
  experimental: { cpus: 2 },
}
