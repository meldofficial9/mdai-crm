# MDAI CRM

MDAI CRM is the first MVP for MDAI Solutions. It is a simple AI Lead Recovery CRM for Medicare and ACA agencies.

## What this version includes

- Next.js CRM dashboard
- Supabase database connection
- Lead metrics
- Lead pipeline view
- Manual test lead form
- Supabase SQL schema
- Netlify deployment support

## Step 1: Create Supabase Project

1. Go to Supabase.
2. Create a new project named `mdai-crm`.
3. Go to **Project Settings > API**.
4. Copy:
   - Project URL
   - Anon public key

## Step 2: Create Tables

1. Go to **SQL Editor** in Supabase.
2. Open `supabase/schema.sql` from this project.
3. Copy all the SQL.
4. Paste it in Supabase SQL Editor.
5. Click **Run**.

## Step 3: Upload to GitHub

1. Create a private GitHub repo named `mdai-crm`.
2. Upload every file from this folder into that repo.
3. Commit the files.

## Step 4: Deploy to Netlify

1. Go to Netlify.
2. Click **Add new site**.
3. Choose **Import an existing project**.
4. Connect GitHub.
5. Select your `mdai-crm` repo.
6. Use these build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`

## Step 5: Add Netlify Environment Variables

In Netlify, go to:

**Site configuration > Environment variables**

Add:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Then redeploy the site.

## Important MVP Security Note

This first version uses simple public read/insert policies so the demo can work quickly. This is okay for an internal prototype, but before real clients use it, we must add login/authentication and secure row-level policies.

## MDAI Blueprint Status

- Database: Started
- Frontend CRM: Started
- Manual lead creation: Included
- AI automation: Not included yet
- Login/auth: Next milestone
