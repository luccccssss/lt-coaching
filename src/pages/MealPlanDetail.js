import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function MealPlanDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', foods: '', calories: '', protein: '', carbs: '', fats: '' })

  useEffect(() => { loadPlan() }, [id])

  async function loadPlan() {
    const { data } = await supabase.from('meal_plans').select('*').eq('id', id).single()
    const { data: m } = await supabase.from('meals').select('*').eq('plan_id', id).order('position', { ascending: true })
    setPlan(data)
    setMeals(m || [])
    setLoading(false)
  }

  async function addMeal(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    await supabase.from('meals').insert({
      plan_id: parseInt(id),
      name: form.name,
      foods: form.foods,
      calories: parseInt(form.calories) || 0,
      protein: parseInt(form.protein) || 0,
      carbs: parseInt(form.carbs) || 0,
      fats: parseInt(form.fats) || 0,
      position: meals.length
    })
    setShowModal(false)
    setForm({ name: '', foods: '', calories: '', protein: '', carbs: '', fats: '' })
    loadPlan()
  }

  async function removeMeal(mealId) {
    await supabase.from('meals').delete().eq('id', mealId)
    setMeals(meals.filter(m => m.id !== mealId))
  }

  async function deletePlan() {
    if (!window.confirm('Delete this plan?')) return
    await supabase.from('meals').delete().eq('plan_id', id)
    await supabase.from('meal_plans').delete().eq('id', id)
    navigate('/meals')
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!plan) return <div className="loading">Plan not found.</div>

  const tc = meals.reduce((a, m) => a + m.calories, 0)
  const tp = meals.reduce((a, m) => a + m.protein, 0)
  const tca = meals.reduce((a, m) => a + m.carbs, 0)
  const tf = meals.reduce((a, m) => a + m.fats, 0)

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/meals')}>
        <i className="ti ti-arrow-left"></i>Back to meal plans
      </button>

      <div className="page-header">
        <div>
          <div className="page-title">{plan.name}</div>
          <div className="page-sub">{meals.length} meals · {plan.goal || 'General'}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => setShowModal(true)}><i className="ti ti-plus"></i>Add meal</button>
          <button className="btn btn-danger" onClick={deletePlan}><i className="ti ti-trash"></i></button>
        </div>
      </div>

      <div className="totals-bar">
        {[
          [tc, 'kcal', 'var(--accent)'],
          [tp + 'g', 'protein', 'var(--blue)'],
          [tca + 'g', 'carbs', 'var(--amber)'],
          [tf + 'g', 'fats', 'var(--green)']
        ].map(([val, lbl, col]) => (
          <div key={lbl} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: col }}>{val}</div>
            <div style={{ fontSize: 11, color: 'var(--text2)' }}>{lbl}</div>
          </div>
        ))}
      </div>

      {meals.length === 0 && <div className="empty-state"><i className="ti ti-bowl"></i>No meals added yet.</div>}

      {meals.map((m, i) => (
        <div key={m.id} className="meal-row">
          <div style={{ width: 24, height: 24, borderRadius: 4, background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>{i + 1}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500 }}>{m.name}</div>
            {m.foods && <div style={{ fontSize: 12, color: 'var(--text3)' }}>{m.foods}</div>}
          </div>
          <div className="meal-macro">{m.calories}<span style={{ color: 'var(--text3)' }}> cal</span></div>
          <div className="meal-macro">{m.protein}g<span style={{ color: 'var(--text3)' }}> P</span></div>
          <div className="meal-macro">{m.carbs}g<span style={{ color: 'var(--text3)' }}> C</span></div>
          <div className="meal-macro">{m.fats}g<span style={{ color: 'var(--text3)' }}> F</span></div>
          <button className="btn btn-danger" onClick={() => removeMeal(m.id)} style={{ padding: '4px 8px' }}><i className="ti ti-x"></i></button>
        </div>
      ))}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Add meal</div>
            <form onSubmit={addMeal}>
              <div className="field-row"><div className="field-label">Meal name</div><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Breakfast, Post-workout" required /></div>
              <div className="field-row"><div className="field-label">Foods (optional)</div><input value={form.foods} onChange={e => setForm({ ...form, foods: e.target.value })} placeholder="e.g. 4 eggs, oats, banana" /></div>
              <div className="grid2" style={{ marginBottom: 8 }}>
                <div className="field-row" style={{ marginBottom: 0 }}><div className="field-label">Calories</div><input type="number" value={form.calories} onChange={e => setForm({ ...form, calories: e.target.value })} placeholder="500" /></div>
                <div className="field-row" style={{ marginBottom: 0 }}><div className="field-label">Protein (g)</div><input type="number" value={form.protein} onChange={e => setForm({ ...form, protein: e.target.value })} placeholder="35" /></div>
              </div>
              <div className="grid2" style={{ marginBottom: 16 }}>
                <div className="field-row" style={{ marginBottom: 0 }}><div className="field-label">Carbs (g)</div><input type="number" value={form.carbs} onChange={e => setForm({ ...form, carbs: e.target.value })} placeholder="50" /></div>
                <div className="field-row" style={{ marginBottom: 0 }}><div className="field-label">Fats (g)</div><input type="number" value={form.fats} onChange={e => setForm({ ...form, fats: e.target.value })} placeholder="15" /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add meal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
