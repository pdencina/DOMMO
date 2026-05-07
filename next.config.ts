/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
  },
  // Required: Supabase auth needs dynamic rendering
  experimental: {
    // This ensures pages that use cookies are always dynamic
  },
}
export default nextConfig
