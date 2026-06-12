import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { generateReport } from '../lib/utils'

export default function Reports() {
  const [clients, setClients] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [report, setReport] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    supabase.from('clients').select('*').then(({ data }) => setClients(data || []))
  }, [])

  async function buildReport() {
    if (!selectedId) return
    const client = clients.find(c => c.id === parseInt(selectedId))
    const [{ data: checkins }, { data: plan }] = await Promise.all([
      supabase.from('checkins').select('*').eq('client_id', selectedId).order('week', { ascending: true }),
      client.meal_plan_id
        ? supabase.from('meal_plans').select('*, meals(*)').eq('id', client.meal_plan_id).single()
        : Promise.resolve({ data: null })
    ])
    setReport(generateReport(client, plan, checkins || []))
  }

  function copyReport() {
    navigator.clipboard.writeText(report).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Reports</div>
          <div className="page-sub">Build and preview client reports</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="section-label">Generate report</div>
        <div className="field-row">
          <div className="field-label">Select client</div>
          <select value={selectedId} onChange={e => setSelectedId(e.target.value)}>
            <option value="">Choose a client...</option>
            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={buildReport} disabled={!selectedId}>
          <i className="ti ti-file-text"></i>Preview report
        </button>
      </div>

      {report && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <div className="section-label" style={{ marginBottom: 0 }}>Report preview</div>
            <button className="btn" onClick={copyReport}>
              <i className={`ti ti-${copied ? 'check' : 'copy'}`}></i>{copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="report-preview">{report}</div>
        </div>
      )}
    </div>
  )
}
