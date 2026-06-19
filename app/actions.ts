'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

function getServerSupabase(): any {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(url, key)
}

async function getDefaultAgencyId(): Promise<string> {
  const supabase = getServerSupabase()

  const { data, error } = await supabase
    .from('agencies')
    .select('id')
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  const agency = data as { id?: string } | null

  if (error) {
    throw new Error(error.message)
  }

  if (!agency?.id) {
    throw new Error('Please create a demo agency in Supabase first.')
  }

  return agency.id
}

function textValue(formData: FormData, key: string, fallback = ''): string {
  return String(formData.get(key) || fallback).trim()
}

export async function addLead(formData: FormData) {
  const supabase = getServerSupabase()
  const agencyId = await getDefaultAgencyId()

  const lead = {
    agency_id: agencyId,
    first_name: textValue(formData, 'first_name'),
    last_name: textValue(formData, 'last_name'),
    phone: textValue(formData, 'phone'),
    email: textValue(formData, 'email'),
    state: textValue(formData, 'state').toUpperCase(),
    zip_code: textValue(formData, 'zip_code'),
    product: textValue(formData, 'product', 'Medicare'),
    status: textValue(formData, 'status', 'New Lead'),
    lead_source: textValue(formData, 'lead_source', 'Manual'),
    interest_level: textValue(formData, 'interest_level', 'Unknown'),
    ai_summary: textValue(formData, 'ai_summary')
  }

  const { error } = await supabase.from('leads').insert(lead)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/')
}

export async function updateLeadStatus(formData: FormData) {
  const supabase = getServerSupabase()
  const leadId = textValue(formData, 'lead_id')

  if (!leadId) {
    throw new Error('Missing lead id')
  }

  const { error } = await supabase
    .from('leads')
    .update({
      status: textValue(formData, 'status', 'New Lead'),
      interest_level: textValue(formData, 'interest_level', 'Unknown'),
      ai_summary: textValue(formData, 'ai_summary'),
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
  const leadId = textValue(formData, 'lead_id')

  if (!leadId) {
    throw new Error('Missing lead id')
  }

  const { error } = await supabase.from('leads').delete().eq('id', leadId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/')
}
