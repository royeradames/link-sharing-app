import path from "node:path"
import { fileURLToPath } from "url"

// Get the directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.alias['@shoelace-style/shoelace/cdn/react'] = path.resolve(__dirname, 'node_modules/@shoelace-style/shoelace/cdn/react');
    return config;
  },
}

export default nextConfig
