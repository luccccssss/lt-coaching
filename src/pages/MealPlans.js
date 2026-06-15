import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function MealPlans() {
  const [plans, setPlans] = useState([])
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [goal, setGoal] = useState('Fat loss')
  const navigate = useNavigate()

  useEffect(() => { loadAll() }, [])

  async function loadAll() {
    const [{ data: p }, { data: c }] = await Promise.all([
      supabase.from('meal_plans').select('*, meals(*)').order('created_at', { ascending: false }),
      supabase.from('clients').select('id, meal_plan_id')
    ])
    setPlans(p || [])
    setClients(c || [])
    setLoading(false)
  }

  async function createPlan(e) {
    e.preventDefault()
    if (!name.trim()) return
    const { data, error } = await supabase.from('meal_plans').insert({ name, goal }).select().single()
    if (error || !data) {
      alert('Error creating plan: ' + (error?.message || 'unknown error'))
      return
    }
    setShowModal(false)
    setName('')
    navigate(`/meals/${data.id}`)
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Meal Plans</div>
          <div className="page-sub">{plans.length} plans</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="ti ti-plus"></i>New plan
        </button>
      </div>

      {plans.length === 0 && (
        <div className="empty-state"><i className="ti ti-salad"></i>No meal plans yet.</div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {plans.map(p => {
          const totalCals = (p.meals || []).reduce((a, m) => a + m.calories, 0)
          const totalProt = (p.meals || []).reduce((a, m) => a + m.protein, 0)
          const assigned = clients.filter(c => c.meal_plan_id === p.id).length
          return (
            <div key={p.id} className="client-card" onClick={() => navigate(`/meals/${p.id}`)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="avatar" style={{ background: 'var(--bg4)' }}>
                  <i className="ti ti-salad" style={{ fontSize: 16, color: 'var(--accent)' }}></i>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>{p.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{(p.meals || []).length} meals · {totalCals} kcal · {totalProt}g P</div>
                </div>
                {assigned > 0
                  ? <span className="badge" style={{ background: 'rgba(77,255,145,0.1)', color: 'var(--green)' }}>{assigned} client{assigned > 1 ? 's' : ''}</span>
                  : <span className="badge" style={{ background: 'var(--bg4)', color: 'var(--text3)' }}>Unassigned</span>
                }
                <i className="ti ti-chevron-right" style={{ color: 'var(--text3)' }}></i>
              </div>
            </div>
          )
        })}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">New meal plan</div>
            <form onSubmit={createPlan}>
              <div className="field-row">
                <div className="field-label">Plan name</div>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Fat Loss — 1800kcal" required />
              </div>
              <div className="field-row">
                <div className="field-label">Goal</div>
                <select value={goal} onChange={e => setGoal(e.target.value)}>
                  <option>Fat loss</option>
                  <option>Muscle building</option>
                  <option>Recomp</option>
                  <option>General</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create plan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
