# MDAI CRM v2.3

This version adds the first MIA Message MVP.

## What changed
- Generate first MIA outreach message for a lead
- Store MIA messages in the `conversations` table
- Log customer replies manually
- Display conversation history under each lead
- Update lead to `AI Contacted` after MIA message is generated

## Required Supabase SQL
Before testing MIA messages, go to Supabase > SQL Editor and run:

`supabase/schema.sql`

This creates/updates:
- agencies
- leads
- conversations
- temporary public demo policies

Important: these demo policies are only for MVP testing. Before real client data, add authentication and secure RLS.

## Netlify
Keep these environment variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY

Deploy through Netlify after uploading to GitHub.
