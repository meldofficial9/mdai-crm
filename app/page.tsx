export const dynamic = 'force-dynamic'

import { supabase } from '@/lib/supabase'
import { addCustomerReply, addLead, deleteLead, generateMiaMessage, updateLeadStatus } from './actions'

type Conversation = {
  id: string
  lead_id: string
  sender: string
  channel: string | null
  message: string
  ai_notes: string | null
  created_at: string
}

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

const pipelineStages = [
  'New Lead',
  'AI Contacted',
  'Qualification in Progress',
  'Qualified Lead',
  'Appointment Scheduled',
  'Not Interested'
]

const interestLevels = ['Unknown', 'Low', 'Medium', 'High']

function statusClass(status: string | null) {
  const value = (status || '').toLowerCase()
  if (value.includes('qualified')) return 'status qualified'
  if (value.includes('appointment')) return 'status appointment'
  if (value.includes('not')) return 'status not'
  if (value.includes('progress')) return 'status progress'
  if (value.includes('contacted')) return 'status contacted'
  if (value.includes('new')) return 'status new'
  return 'status'
}

function fullName(lead: Lead) {
  return `${lead.first_name || 'Unknown'} ${lead.last_name || ''}`.trim()
}

export default async function Home() {
  const { data: leads, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: conversations } = await supabase
    .from('conversations')
    .select('*')
    .order('created_at', { ascending: true })

  const safeLeads = (leads || []) as Lead[]
  const safeConversations = (conversations || []) as Conversation[]
  const newLeads = safeLeads.filter((lead) => lead.status === 'New Lead').length
  const contacted = safeLeads.filter((lead) => (lead.status || '').includes('Contacted')).length
  const qualified = safeLeads.filter((lead) => (lead.status || '').includes('Qualified')).length
  const appointments = safeLeads.filter((lead) => (lead.status || '').includes('Appointment')).length
  const highIntent = safeLeads.filter((lead) => lead.interest_level === 'High').length

  return (
    <main className="page">
      <header className="header">
        <div className="logoBlock">
          <p className="eyebrow">MDAI Solutions</p>
          <h1>MDAI CRM</h1>
          <p>AI Lead Recovery Dashboard for Medicare & ACA agencies</p>
        </div>
        <div className="badge">MIA v1.2 · Message MVP</div>
      </header>

      {error && (
        <div className="error">
          Supabase error: {error.message}. Check your Netlify environment variables and Supabase tables.
        </div>
      )}

      <section className="grid metricsGrid">
        <div className="card metricCard">
          <p className="metricLabel">Total Leads</p>
          <p className="metricValue">{safeLeads.length}</p>
        </div>
        <div className="card metricCard">
          <p className="metricLabel">New Leads</p>
          <p className="metricValue">{newLeads}</p>
        </div>
        <div className="card metricCard">
          <p className="metricLabel">AI Contacted</p>
          <p className="metricValue">{contacted}</p>
        </div>
        <div className="card metricCard">
          <p className="metricLabel">Qualified</p>
          <p className="metricValue">{qualified}</p>
        </div>
        <div className="card metricCard">
          <p className="metricLabel">Appointments</p>
          <p className="metricValue">{appointments}</p>
        </div>
        <div className="card metricCard">
          <p className="metricLabel">High Interest</p>
          <p className="metricValue">{highIntent}</p>
        </div>
      </section>

      <section className="card pipelineCard">
        <div className="sectionHeader">
          <div>
            <h2 className="sectionTitle">Pipeline Board</h2>
            <p className="smallText">A quick view of where every lead stands.</p>
          </div>
        </div>
        <div className="pipelineBoard">
          {pipelineStages.map((stage) => {
            const stageLeads = safeLeads.filter((lead) => (lead.status || 'New Lead') === stage)
            return (
              <div className="pipelineColumn" key={stage}>
                <div className="columnHeader">
                  <span>{stage}</span>
                  <strong>{stageLeads.length}</strong>
                </div>
                <div className="miniLeadList">
                  {stageLeads.length === 0 && <p className="emptyText">No leads</p>}
                  {stageLeads.slice(0, 4).map((lead) => (
                    <div className="miniLead" key={lead.id}>
                      <strong>{fullName(lead)}</strong>
                      <span>{lead.product || 'Medicare'} · {lead.interest_level || 'Unknown'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      <section className="mainGrid">
        <div className="card">
          <div className="sectionHeader">
            <div>
              <h2 className="sectionTitle">Lead List</h2>
              <p className="smallText">Update status and MIA notes directly from the CRM.</p>
            </div>
          </div>

          <div className="leadList">
            {safeLeads.length === 0 && (
              <p className="smallText">No leads yet. Add your first test lead using the form.</p>
            )}

            {safeLeads.map((lead) => (
              <div key={lead.id} className="leadCard">
                <div className="leadTop">
                  <div>
                    <p className="leadName">{fullName(lead)}</p>
                    <p className="leadMeta">
                      {lead.product || 'Medicare'} · {lead.state || 'State N/A'} · ZIP {lead.zip_code || 'N/A'}
                    </p>
                  </div>
                  <span className={statusClass(lead.status)}>{lead.status || 'New Lead'}</span>
                </div>

                <div className="contactRows">
                  <p>Phone: {lead.phone || 'N/A'}</p>
                  <p>Email: {lead.email || 'N/A'}</p>
                  <p>Source: {lead.lead_source || 'Manual'}</p>
                  <p>Interest: {lead.interest_level || 'Unknown'}</p>
                </div>

                {lead.ai_summary && <p className="noteBox">MIA Notes: {lead.ai_summary}</p>}

                <div className="miaPanel">
                  <div className="miaHeader">
                    <div>
                      <strong>MIA Conversation</strong>
                      <p className="smallText">Generate the first compliant outreach message and log customer replies.</p>
                    </div>
                    <form action={generateMiaMessage}>
                      <input type="hidden" name="lead_id" value={lead.id} />
                      <button type="submit">Generate MIA Message</button>
                    </form>
                  </div>

                  <div className="conversationList">
                    {safeConversations.filter((conversation) => conversation.lead_id === lead.id).length === 0 && (
                      <p className="emptyText">No conversation yet.</p>
                    )}
                    {safeConversations
                      .filter((conversation) => conversation.lead_id === lead.id)
                      .map((conversation) => (
                        <div key={conversation.id} className={conversation.sender === 'MIA' ? 'message miaMessage' : 'message customerMessage'}>
                          <span>{conversation.sender}</span>
                          <p>{conversation.message}</p>
                        </div>
                      ))}
                  </div>

                  <form action={addCustomerReply} className="replyForm">
                    <input type="hidden" name="lead_id" value={lead.id} />
                    <input name="message" placeholder="Paste customer reply here..." />
                    <button type="submit">Log Reply</button>
                  </form>
                </div>

                <form action={updateLeadStatus} className="inlineForm">
                  <input type="hidden" name="lead_id" value={lead.id} />
                  <label>
                    Status
                    <select name="status" defaultValue={lead.status || 'New Lead'}>
                      {pipelineStages.map((stage) => (
                        <option key={stage}>{stage}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Interest
                    <select name="interest_level" defaultValue={lead.interest_level || 'Unknown'}>
                      {interestLevels.map((level) => (
                        <option key={level}>{level}</option>
                      ))}
                    </select>
                  </label>
                  <label className="full">
                    MIA Notes
                    <textarea name="ai_summary" defaultValue={lead.ai_summary || ''} />
                  </label>
                  <button type="submit">Update Lead</button>
                </form>

                <form action={deleteLead}>
                  <input type="hidden" name="lead_id" value={lead.id} />
                  <button className="deleteButton" type="submit">Delete Lead</button>
                </form>
              </div>
            ))}
          </div>
        </div>

        <div className="card stickyCard">
          <h2 className="sectionTitle">Add New Lead</h2>
          <p className="smallText">Use this to add test leads or manually enter leads for the first demo agency.</p>
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
              <input name="email" placeholder="john@example.com" />
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
                {pipelineStages.map((stage) => (
                  <option key={stage}>{stage}</option>
                ))}
              </select>
            </label>
            <label>
              Lead Source
              <input name="lead_source" placeholder="Facebook" />
            </label>
            <label>
              Interest Level
              <select name="interest_level" defaultValue="Unknown">
                {interestLevels.map((level) => (
                  <option key={level}>{level}</option>
                ))}
              </select>
            </label>
            <label className="full">
              MIA Notes
              <textarea name="ai_summary" placeholder="Interested in Medicare Advantage. Wants a call after 5 PM." />
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
