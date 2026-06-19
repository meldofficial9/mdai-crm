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

async function getDefaultAgencyId(supabase: ReturnType<typeof createClient>) {
  const { data: agency, error } = await supabase
    .from('agencies')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  if (error || !agency) {
    throw new Error('Please create a demo agency in Supabase first.')
  }

  return agency.id
}

export async function addLead(formData: FormData) {
  const supabase = getServerSupabase()
  const agencyId = await getDefaultAgencyId(supabase)

  const lead = {
    agency_id: agencyId,
    first_name: String(formData.get('first_name') || '').trim(),
    last_name: String(formData.get('last_name') || '').trim(),
    phone: String(formData.get('phone') || '').trim(),
    email: String(formData.get('email') || '').trim(),
    state: String(formData.get('state') || '').trim().toUpperCase(),
    zip_code: String(formData.get('zip_code') || '').trim(),
    product: String(formData.get('product') || 'Medicare'),
    status: String(formData.get('status') || 'New Lead'),
    lead_source: String(formData.get('lead_source') || 'Manual'),
    interest_level: String(formData.get('interest_level') || 'Unknown'),
    ai_summary: String(formData.get('ai_summary') || '').trim()
  }

  const { error } = await supabase.from('leads').insert(lead)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/')
}

export async function updateLeadStatus(formData: FormData) {
  const supabase = getServerSupabase()
  const leadId = String(formData.get('lead_id') || '')
  const status = String(formData.get('status') || 'New Lead')
  const interestLevel = String(formData.get('interest_level') || 'Unknown')
  const aiSummary = String(formData.get('ai_summary') || '').trim()

  if (!leadId) {
    throw new Error('Missing lead id')
  }

  const { error } = await supabase
    .from('leads')
    .update({
      status,
      interest_level: interestLevel,
      ai_summary: aiSummary,
      last_contact_at: new Date().toISOString()
    })
    .eq('id', leadId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/')
}

export async function deleteLead(formData: FormData) {
  const supabase = getServerSupabase()
  const leadId = String(formData.get('lead_id') || '')

  if (!leadId) {
    throw new Error('Missing lead id')
  }

  const { error } = await supabase.from('leads').delete().eq('id', leadId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/')
}
