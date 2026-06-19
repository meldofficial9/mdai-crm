# MDAI CRM v1.1

This version adds:

- Add New Lead form
- Lead status updates
- Interest level updates
- MIA notes updates
- Delete lead button
- Pipeline board
- Dashboard metrics
- Dynamic Netlify/Supabase data refresh

## Upload steps

1. Download and unzip this folder.
2. Upload the contents into the GitHub repo.
3. Commit changes.
4. Netlify should redeploy automatically.

## Required Netlify environment variables

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

## Supabase note

For demo testing, RLS may be disabled. Before using real clients, authentication and RLS policies must be added.
