/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // The Supabase URL and publishable key can be given either as
  // NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY (e.g. in .env.local)
  // or as SUPABASE_URL / SUPABASE_ANON_KEY (e.g. on Vercel). They are built into the site,
  // which is safe: the publishable key is meant to be public.
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "",
  },
};
export default nextConfig;
