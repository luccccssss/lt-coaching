import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

const defaults = { name: '', gender: 'male', goal: 'Fat loss', start_weight: '', target_weight: '', weeks: 12, calories: 1800, protein: 150, carbs: 150, fats: 60, notes: '' }

export default function ClientModal({ client, onClose, onSave }) {
  const [form, setForm] = useState(client ? {
    name: client.name, gender: client.gender, goal: client.goal,
    start_weight: client.start_weight, target_weight: client.target_weight,
    weeks: client.weeks, calories: client.calories, protein: client.protein,
    carbs: client.carbs, fats: client.fats, notes: client.notes || ''
  } : { ...defaults })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSave(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    const data = {
      name: form.name, gender: form.gender, goal: form.goal,
      start_weight: parseFloat(form.start_weight) || 70,
      target_weight: parseFloat(form.target_weight) || 65,
      weeks: parseInt(form.weeks) || 12,
      calories: parseInt(form.calories) || 1800,
      protein: parseInt(form.protein) || 150,
      carbs: parseInt(form.carbs) || 150,
      fats: parseInt(form.fats) || 60,
      notes: form.notes, status: 'active'
    }
    if (client) {
      await supabase.from('clients').update(data).eq('id', client.id)
    } else {
      await supabase.from('clients').insert(data)
    }
    setSaving(false)
    onSave()
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-title">{client ? `Edit ${client.name}` : 'Add client'}</div>
        <form onSubmit={handleSave}>
          <div className="field-row"><div className="field-label">Name</div><input value={form.name} onChange={e => set('name', e.target.value)} placeholder="Full name" required /></div>
          <div className="grid2" style={{ marginBottom: 14 }}>
            <div className="field-row" style={{ marginBottom: 0 }}>
              <div className="field-label">Gender</div>
              <select value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="field-row" style={{ marginBottom: 0 }}>
              <div className="field-label">Goal</div>
              <select value={form.goal} onChange={e => set('goal', e.target.value)}>
                <option>Fat loss</option>
                <option>Muscle building</option>
                <option>Recomp</option>
              </select>
            </div>
          </div>
          <div className="grid2" style={{ marginBottom: 14 }}>
            <div className="field-row" style={{ marginBottom: 0 }}><div className="field-label">Start weight (kg)</div><input type="number" step="0.1" value={form.start_weight} onChange={e => set('start_weight', e.target.value)} placeholder="70" /></div>
            <div className="field-row" style={{ marginBottom: 0 }}><div className="field-label">Target weight (kg)</div><input type="number" step="0.1" value={form.target_weight} onChange={e => set('target_weight', e.target.value)} placeholder="65" /></div>
          </div>
          <div className="field-row"><div className="field-label">Program length (weeks)</div><input type="number" value={form.weeks} onChange={e => set('weeks', e.target.value)} placeholder="12" /></div>
          <div className="section-label" style={{ marginTop: 4 }}>Daily targets</div>
          <div className="grid2" style={{ marginBottom: 8 }}>
            <div className="field-row" style={{ marginBottom: 0 }}><div className="field-label">Calories</div><input type="number" value={form.calories} onChange={e => set('calories', e.target.value)} placeholder="1800" /></div>
            <div className="field-row" style={{ marginBottom: 0 }}><div className="field-label">Protein (g)</div><input type="number" value={form.protein} onChange={e => set('protein', e.target.value)} placeholder="150" /></div>
          </div>
          <div className="grid2" style={{ marginBottom: 14 }}>
            <div className="field-row" style={{ marginBottom: 0 }}><div className="field-label">Carbs (g)</div><input type="number" value={form.carbs} onChange={e => set('carbs', e.target.value)} placeholder="150" /></div>
            <div className="field-row" style={{ marginBottom: 0 }}><div className="field-label">Fats (g)</div><input type="number" value={form.fats} onChange={e => set('fats', e.target.value)} placeholder="60" /></div>
          </div>
          <div className="field-row"><div className="field-label">Notes</div><textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows="2" placeholder="Training history, injuries, lifestyle..." /></div>
          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : client ? 'Save' : 'Add client'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
