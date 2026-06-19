import { supabase } from '@/lib/supabase'
import { addLead } from './actions'

type Lead = {
  id: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  email: string | null
  state: string | null
  zip_code: string | null
  product: string | null
  status: string | null
  lead_source: string | null
  interest_level: string | null
  ai_summary: string | null
  created_at: string
}

function statusClass(status: string | null) {
  const value = (status || '').toLowerCase()
  if (value.includes('qualified')) return 'status qualified'
  if (value.includes('appointment')) return 'status appointment'
  if (value.includes('not')) return 'status not'
  if (value.includes('new')) return 'status new'
  return 'status'
}

export default async function Home() {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  const safeLeads = (leads || []) as Lead[]
  const newLeads = safeLeads.filter((lead) => lead.status === 'New Lead').length
  const qualified = safeLeads.filter((lead) => (lead.status || '').includes('Qualified')).length
  const appointments = safeLeads.filter((lead) => (lead.status || '').includes('Appointment')).length

  return (
    <main className="page">
      <header className="header">
        <div className="logoBlock">
          <h1>MDAI CRM</h1>
          <p>AI Lead Recovery Dashboard for Medicare & ACA agencies</p>
        </div>
        <div className="badge">MIA v1.0 · Manual CRM MVP</div>
      </header>

      {error && (
        <div className="error">
          Supabase error: {error.message}. Check your Netlify environment variables and Supabase tables.
        </div>
      )}

      <section className="grid">
        <div className="card">
          <p className="metricLabel">Total Leads</p>
          <p className="metricValue">{safeLeads.length}</p>
        </div>
        <div className="card">
          <p className="metricLabel">New Leads</p>
          <p className="metricValue">{newLeads}</p>
        </div>
        <div className="card">
          <p className="metricLabel">Qualified</p>
          <p className="metricValue">{qualified}</p>
        </div>
        <div className="card">
          <p className="metricLabel">Appointments</p>
          <p className="metricValue">{appointments}</p>
        </div>
      </section>

      <section className="mainGrid">
        <div className="card">
          <h2 className="sectionTitle">Lead Pipeline</h2>
          <div className="leadList">
            {safeLeads.length === 0 && (
              <p className="smallText">No leads yet. Add your first test lead using the form.</p>
            )}

            {safeLeads.map((lead) => (
              <article className="leadCard" key={lead.id}>
                <div className="leadTop">
                  <div>
                    <p className="leadName">
                      {lead.first_name || 'Unknown'} {lead.last_name || ''}
                    </p>
                    <p className="leadMeta">{lead.product || 'Medicare'} · {lead.state || 'State N/A'} · ZIP {lead.zip_code || 'N/A'}</p>
                  </div>
                  <span className={statusClass(lead.status)}>{lead.status || 'New Lead'}</span>
                </div>
                <p className="smallText">Phone: {lead.phone || 'N/A'} · Email: {lead.email || 'N/A'}</p>
                <p className="smallText">Source: {lead.lead_source || 'Manual'} · Interest: {lead.interest_level || 'Unknown'}</p>
                {lead.ai_summary && <p className="smallText">MIA Notes: {lead.ai_summary}</p>}
              </article>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="sectionTitle">Add Test Lead</h2>
          <form action={addLead} className="formGrid">
            <label>
              First Name
              <input name="first_name" placeholder="John" required />
            </label>
            <label>
              Last Name
              <input name="last_name" placeholder="Smith" />
            </label>
            <label>
              Phone
              <input name="phone" placeholder="555-123-4567" />
            </label>
            <label>
              Email
              <input name="email" placeholder="john@email.com" />
            </label>
            <label>
              State
              <input name="state" placeholder="FL" />
            </label>
            <label>
              ZIP Code
              <input name="zip_code" placeholder="33101" />
            </label>
            <label>
              Product
              <select name="product" defaultValue="Medicare">
                <option>Medicare</option>
                <option>ACA</option>
                <option>Other</option>
              </select>
            </label>
            <label>
              Status
              <select name="status" defaultValue="New Lead">
                <option>New Lead</option>
                <option>AI Contacted</option>
                <option>Qualification in Progress</option>
                <option>Qualified Lead</option>
                <option>Appointment Scheduled</option>
                <option>Not Interested</option>
              </select>
            </label>
            <label>
              Lead Source
              <input name="lead_source" placeholder="Facebook" />
            </label>
            <label>
              Interest Level
              <select name="interest_level" defaultValue="Unknown">
                <option>Unknown</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>
            <label className="full">
              MIA Notes
              <textarea name="ai_summary" placeholder="Interested in Medicare options, prefers SMS, available after 5 PM." />
            </label>
            <div className="full">
              <button type="submit">Add Lead</button>
            </div>
          </form>
        </div>
      </section>
    </main>
  )
}
