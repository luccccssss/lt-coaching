import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const AUSSIE_FOODS = [
  // Proteins
  { name: 'Chicken breast', per100: { cal: 165, p: 31, c: 0, f: 3.6 }, category: 'Protein' },
  { name: 'Chicken thigh (skinless)', per100: { cal: 177, p: 25, c: 0, f: 8 }, category: 'Protein' },
  { name: 'Lean beef mince (5% fat)', per100: { cal: 137, p: 21, c: 0, f: 5.5 }, category: 'Protein' },
  { name: 'Salmon fillet', per100: { cal: 208, p: 20, c: 0, f: 13 }, category: 'Protein' },
  { name: 'Tuna in springwater (can)', per100: { cal: 109, p: 25, c: 0, f: 0.9 }, category: 'Protein' },
  { name: 'Eggs (whole)', per100: { cal: 143, p: 13, c: 0.7, f: 10 }, category: 'Protein' },
  { name: 'Egg whites', per100: { cal: 52, p: 11, c: 0.7, f: 0.2 }, category: 'Protein' },
  { name: 'Greek yoghurt (plain, 0% fat)', per100: { cal: 59, p: 10, c: 3.6, f: 0.4 }, category: 'Protein' },
  { name: 'Cottage cheese (low fat)', per100: { cal: 84, p: 11, c: 3.4, f: 2.3 }, category: 'Protein' },
  { name: 'Protein powder (whey)', per100: { cal: 382, p: 75, c: 8, f: 5 }, category: 'Protein' },
  { name: 'Lean pork loin', per100: { cal: 143, p: 26, c: 0, f: 4 }, category: 'Protein' },
  { name: 'Turkey breast', per100: { cal: 135, p: 30, c: 0, f: 1 }, category: 'Protein' },
  { name: 'Prawns', per100: { cal: 99, p: 21, c: 0, f: 1.1 }, category: 'Protein' },

  // Carbs
  { name: 'White rice (cooked)', per100: { cal: 130, p: 2.7, c: 28, f: 0.3 }, category: 'Carbs' },
  { name: 'Brown rice (cooked)', per100: { cal: 123, p: 2.6, c: 26, f: 1 }, category: 'Carbs' },
  { name: 'Rolled oats (dry)', per100: { cal: 379, p: 13, c: 67, f: 7 }, category: 'Carbs' },
  { name: 'Sweet potato (cooked)', per100: { cal: 90, p: 2, c: 21, f: 0.1 }, category: 'Carbs' },
  { name: 'White potato (cooked)', per100: { cal: 87, p: 1.9, c: 20, f: 0.1 }, category: 'Carbs' },
  { name: 'Bread (wholegrain, Tip Top)', per100: { cal: 247, p: 9, c: 43, f: 4 }, category: 'Carbs' },
  { name: 'Pasta (cooked)', per100: { cal: 158, p: 5.8, c: 31, f: 0.9 }, category: 'Carbs' },
  { name: 'Rice cakes (Sakata)', per100: { cal: 387, p: 8, c: 83, f: 1.5 }, category: 'Carbs' },
  { name: 'Banana', per100: { cal: 89, p: 1.1, c: 23, f: 0.3 }, category: 'Carbs' },
  { name: 'Apple', per100: { cal: 52, p: 0.3, c: 14, f: 0.2 }, category: 'Carbs' },
  { name: 'Blueberries', per100: { cal: 57, p: 0.7, c: 14, f: 0.3 }, category: 'Carbs' },
  { name: 'Strawberries', per100: { cal: 32, p: 0.7, c: 7.7, f: 0.3 }, category: 'Carbs' },

  // Fats
  { name: 'Olive oil', per100: { cal: 884, p: 0, c: 0, f: 100 }, category: 'Fats' },
  { name: 'Avocado', per100: { cal: 160, p: 2, c: 9, f: 15 }, category: 'Fats' },
  { name: 'Almonds', per100: { cal: 579, p: 21, c: 22, f: 50 }, category: 'Fats' },
  { name: 'Natural peanut butter', per100: { cal: 588, p: 25, c: 20, f: 50 }, category: 'Fats' },
  { name: 'Cashews', per100: { cal: 553, p: 18, c: 30, f: 44 }, category: 'Fats' },
  { name: 'Cheese (cheddar, reduced fat)', per100: { cal: 311, p: 30, c: 0.5, f: 20 }, category: 'Fats' },
  { name: 'Full fat milk', per100: { cal: 61, p: 3.2, c: 4.8, f: 3.3 }, category: 'Fats' },
  { name: 'Skim milk', per100: { cal: 35, p: 3.4, c: 5, f: 0.1 }, category: 'Fats' },

  // Vegetables
  { name: 'Broccoli', per100: { cal: 34, p: 2.8, c: 7, f: 0.4 }, category: 'Veg' },
  { name: 'Spinach', per100: { cal: 23, p: 2.9, c: 3.6, f: 0.4 }, category: 'Veg' },
  { name: 'Zucchini', per100: { cal: 17, p: 1.2, c: 3.1, f: 0.3 }, category: 'Veg' },
  { name: 'Capsicum', per100: { cal: 31, p: 1, c: 6, f: 0.3 }, category: 'Veg' },
  { name: 'Green beans', per100: { cal: 31, p: 1.8, c: 7, f: 0.1 }, category: 'Veg' },
  { name: 'Mixed salad leaves', per100: { cal: 20, p: 1.5, c: 3, f: 0.3 }, category: 'Veg' },
  { name: 'Cucumber', per100: { cal: 16, p: 0.7, c: 3.6, f: 0.1 }, category: 'Veg' },
  { name: 'Tomato', per100: { cal: 18, p: 0.9, c: 3.9, f: 0.2 }, category: 'Veg' },
  { name: 'Mushrooms', per100: { cal: 22, p: 3.1, c: 3.3, f: 0.3 }, category: 'Veg' },
  { name: 'Onion', per100: { cal: 40, p: 1.1, c: 9, f: 0.1 }, category: 'Veg' },
]

export default function Generator() {
  const navigate = useNavigate()
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState('')
  const [numMeals, setNumMeals] = useState(4)
  const [selectedFoods, setSelectedFoods] = useState(AUSSIE_FOODS.map(f => f.name))
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState(null)
  const [saving, setSaving] = useState(false)
  const [planName, setPlanName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('clients').select('*').then(({ data }) => setClients(data || []))
  }, [])

  const client = clients.find(c => c.id === parseInt(selectedClient))
  const categories = ['All', 'Protein', 'Carbs', 'Fats', 'Veg']
  const filteredFoods = categoryFilter === 'All' ? AUSSIE_FOODS : AUSSIE_FOODS.filter(f => f.category === categoryFilter)

  function toggleFood(name) {
    setSelectedFoods(prev => prev.includes(name) ? prev.filter(f => f !== name) : [...prev, name])
  }

  function toggleCategory(cat) {
    const inCat = AUSSIE_FOODS.filter(f => f.category === cat).map(f => f.name)
    const allSelected = inCat.every(n => selectedFoods.includes(n))
    if (allSelected) {
      setSelectedFoods(prev => prev.filter(n => !inCat.includes(n)))
    } else {
      setSelectedFoods(prev => [...new Set([...prev, ...inCat])])
    }
  }

  async function generate() {
    if (!client) return
    setGenerating(true)
    setError('')
    setResult(null)

    const approved = AUSSIE_FOODS.filter(f => selectedFoods.includes(f.name))
    const foodList = approved.map(f =>
      `${f.name} (per 100g: ${f.per100.cal}cal, ${f.per100.p}g P, ${f.per100.c}g C, ${f.per100.f}g F) [${f.category}]`
    ).join('\n')

    const prompt = `You are a nutrition coach. Create a ${numMeals}-meal daily meal plan for a client with these targets:
- Calories: ${client.calories} kcal
- Protein: ${client.protein}g
- Carbs: ${client.carbs}g  
- Fats: ${client.fats}g
- Goal: ${client.goal}

Use ONLY foods from this approved list. Specify realistic gram amounts:
${foodList}

Return ONLY valid JSON, no markdown, no explanation. Format:
{
  "meals": [
    {
      "name": "Meal name (e.g. Breakfast)",
      "foods": [
        { "food": "Food name", "grams": 150 }
      ],
      "calories": 450,
      "protein": 35,
      "carbs": 45,
      "fats": 12
    }
  ],
  "totals": { "calories": 1800, "protein": 145, "carbs": 160, "fats": 65 }
}

Make the meals realistic and practical. Hit the targets as closely as possible (within 5%).`

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await response.json()
      const text = data.content[0].text.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(text)
      setResult(parsed)
      setPlanName(`${client.name} — ${client.goal} ${client.calories}kcal`)
    } catch (e) {
      setError('Failed to generate. Try again.')
    }
    setGenerating(false)
  }

  async function savePlan() {
    if (!result || !planName.trim()) return
    setSaving(true)
    const { data: plan } = await supabase.from('meal_plans').insert({
      name: planName,
      goal: client.goal
    }).select().single()

    await supabase.from('meals').insert(
      result.meals.map((m, i) => ({
        plan_id: plan.id,
        name: m.name,
        foods: m.foods.map(f => `${f.food} (${f.grams}g)`).join(', '),
        calories: m.calories,
        protein: m.protein,
        carbs: m.carbs,
        fats: m.fats,
        position: i
      }))
    )

    await supabase.from('clients').update({ meal_plan_id: plan.id }).eq('id', client.id)
    setSaving(false)
    navigate(`/meals/${plan.id}`)
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Meal Plan Generator</div>
          <div className="page-sub">AI-powered · Australian foods</div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="section-label">Client & targets</div>
        <div className="grid2" style={{ marginBottom: 14 }}>
          <div className="field-row" style={{ marginBottom: 0 }}>
            <div className="field-label">Client</div>
            <select value={selectedClient} onChange={e => setSelectedClient(e.target.value)}>
              <option value="">Select client...</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="field-row" style={{ marginBottom: 0 }}>
            <div className="field-label">Meals per day</div>
            <select value={numMeals} onChange={e => setNumMeals(parseInt(e.target.value))}>
              {[3, 4, 5, 6].map(n => <option key={n} value={n}>{n} meals</option>)}
            </select>
          </div>
        </div>

        {client && (
          <div style={{ background: 'var(--bg4)', borderRadius: 'var(--radius)', padding: '10px 14px', display: 'flex', gap: 20 }}>
            {[
              [client.calories, 'kcal', 'var(--accent)'],
              [client.protein + 'g', 'P', 'var(--blue)'],
              [client.carbs + 'g', 'C', 'var(--amber)'],
              [client.fats + 'g', 'F', 'var(--green)']
            ].map(([val, lbl, col]) => (
              <div key={lbl} style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 600, color: col }}>{val}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>{lbl}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div className="section-label" style={{ marginBottom: 0 }}>Approved foods ({selectedFoods.length}/{AUSSIE_FOODS.length})</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-sm" onClick={() => setSelectedFoods(AUSSIE_FOODS.map(f => f.name))}>All</button>
            <button className="btn btn-sm" onClick={() => setSelectedFoods([])}>None</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              className={'btn btn-sm' + (categoryFilter === cat ? ' btn-primary' : '')}
              onClick={() => setCategoryFilter(cat)}
            >{cat}</button>
          ))}
        </div>

        {categoryFilter !== 'All' && (
          <button className="btn btn-sm" style={{ marginBottom: 10 }} onClick={() => toggleCategory(categoryFilter)}>
            Toggle all {categoryFilter}
          </button>
        )}

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {filteredFoods.map(f => (
            <div
              key={f.name}
              onClick={() => toggleFood(f.name)}
              style={{
                padding: '5px 10px',
                borderRadius: 4,
                fontSize: 12,
                cursor: 'pointer',
                border: '0.5px solid',
                borderColor: selectedFoods.includes(f.name) ? 'var(--accent)' : 'var(--border2)',
                color: selectedFoods.includes(f.name) ? 'var(--accent)' : 'var(--text2)',
                background: selectedFoods.includes(f.name) ? 'rgba(200,240,69,0.08)' : 'transparent',
                transition: 'all 0.15s'
              }}
            >
              {f.name}
            </div>
          ))}
        </div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <button
        className="btn btn-primary"
        onClick={generate}
        disabled={!client || generating || selectedFoods.length === 0}
        style={{ width: '100%', justifyContent: 'center', marginBottom: 20, padding: '12px' }}
      >
        {generating
          ? <><i className="ti ti-loader" style={{ animation: 'spin 1s linear infinite' }}></i>Generating...</>
          : <><i className="ti ti-sparkles"></i>Generate meal plan</>
        }
      </button>

      {result && (
        <div>
          <div className="card" style={{ marginBottom: 16 }}>
            <div className="section-label">Generated plan</div>
            <div className="totals-bar" style={{ marginBottom: 16 }}>
              {[
                [result.totals.calories, 'kcal', 'var(--accent)', client.calories],
                [result.totals.protein + 'g', 'protein', 'var(--blue)', client.protein],
                [result.totals.carbs + 'g', 'carbs', 'var(--amber)', client.carbs],
                [result.totals.fats + 'g', 'fats', 'var(--green)', client.fats]
              ].map(([val, lbl, col, target]) => (
                <div key={lbl} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 600, color: col }}>{val}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)' }}>{lbl}</div>
                  <div style={{ fontSize: 10, color: 'var(--text3)' }}>target: {target}{lbl === 'kcal' ? '' : 'g'}</div>
                </div>
              ))}
            </div>

            {result.meals.map((meal, i) => (
              <div key={i} style={{ marginBottom: 12, padding: '12px 14px', background: 'var(--bg3)', borderRadius: 'var(--radius)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontWeight: 500 }}>{meal.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{meal.calories} kcal · {meal.protein}g P · {meal.carbs}g C · {meal.fats}g F</div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {meal.foods.map((f, j) => (
                    <span key={j} style={{ fontSize: 12, color: 'var(--text2)', background: 'var(--bg4)', padding: '3px 8px', borderRadius: 4 }}>
                      {f.food} <span style={{ color: 'var(--accent)' }}>{f.grams}g</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="section-label">Save plan</div>
            <div className="field-row">
              <div className="field-label">Plan name</div>
              <input value={planName} onChange={e => setPlanName(e.target.value)} placeholder="Plan name..." />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" onClick={generate} disabled={generating}>
                <i className="ti ti-refresh"></i>Regenerate
              </button>
              <button className="btn btn-primary" onClick={savePlan} disabled={saving || !planName.trim()}>
                {saving ? 'Saving...' : <><i className="ti ti-check"></i>Save & assign to {client.name}</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
