# MDAI CRM v2.2

This version fixes the Netlify TypeScript build error in `app/actions.ts` by removing fragile Supabase generic typing.

## Upload

1. Unzip this folder.
2. Upload the contents to your GitHub repo.
3. Commit changes.
4. In Netlify, run **Trigger deploy → Clear cache and deploy site**.

## Required Netlify Environment Variables

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

## Supabase Testing

For demo testing only, make sure RLS is disabled or you have public read/write policies for the demo tables.
