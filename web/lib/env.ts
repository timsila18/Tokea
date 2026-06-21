import { z } from 'zod';

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  NEXT_PUBLIC_SITE_URL: z.string().url().default('https://tokea.co.ke'),
});

function envOrFallback(value: string | undefined, fallback: string) {
  return value && value.trim().length > 0 ? value : fallback;
}

export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: envOrFallback(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    'https://vqowmnmqfdufgjbekdll.supabase.co',
  ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: envOrFallback(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'sb_publishable_Et9sC_MC_uZuwLjk9Q2nRw_dhPjDEVT',
  ),
  NEXT_PUBLIC_SITE_URL: envOrFallback(process.env.NEXT_PUBLIC_SITE_URL, 'https://tokea.co.ke'),
});
