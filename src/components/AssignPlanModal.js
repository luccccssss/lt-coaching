import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function AssignPlanModal({ client, onClose, onSave }) {
  const [plans, setPlans] = useState([])
  const [selected, setSelected] = useState(client.meal_plan_id || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('meal_plans').select('id, name, goal').then(({ data }) => setPlans(data || []))
  }, [])

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    await supabase.from('clients').update({ meal_plan_id: selected || null }).eq('id', client.id)
    setSaving(false)
    onSave()
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-title">Assign plan to {client.name}</div>
        <form onSubmit={handleSave}>
          {plans.length === 0 ? (
            <div style={{ color: 'var(--text2)', marginBottom: 16, fontSize: 13 }}>No meal plans yet. Create one in Meal Plans first.</div>
          ) : (
            <div className="field-row">
              <div className="field-label">Select plan</div>
              <select value={selected} onChange={e => setSelected(e.target.value)}>
                <option value="">None</option>
                {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}
          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            {plans.length > 0 && <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Assign'}</button>}
          </div>
        </form>
      </div>
    </div>
  )
}
