'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(url, key)
}

export async function addLead(formData: FormData) {
  const supabase = getServerSupabase()

  const { data: agency } = await supabase
    .from('agencies')
    .select('id')
    .limit(1)
    .single()

  if (!agency) {
    throw new Error('Please create a demo agency in Supabase first.')
  }

  const lead = {
    agency_id: agency.id,
    first_name: String(formData.get('first_name') || ''),
    last_name: String(formData.get('last_name') || ''),
    phone: String(formData.get('phone') || ''),
    email: String(formData.get('email') || ''),
    state: String(formData.get('state') || ''),
    zip_code: String(formData.get('zip_code') || ''),
    product: String(formData.get('product') || 'Medicare'),
    status: String(formData.get('status') || 'New Lead'),
    lead_source: String(formData.get('lead_source') || ''),
    interest_level: String(formData.get('interest_level') || 'Unknown'),
    ai_summary: String(formData.get('ai_summary') || '')
  }

  const { error } = await supabase.from('leads').insert(lead)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/')
}
