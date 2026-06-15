import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const CATEGORIES = ['All', 'Protein', 'Carbs', 'Fats', 'Veg', 'Dairy', 'Other']

export default function FoodLibrary() {
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState(null)
  const [uploadError, setUploadError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'Protein', calories: '', protein: '', carbs: '', fats: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadFoods() }, [])

  async function loadFoods() {
    const { data } = await supabase.from('foods').select('*').order('name', { ascending: true })
    setFoods(data || [])
    setLoading(false)
  }

  async function handlePDFUpload(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      setUploadError('Please upload a PDF file')
      return
    }

    setUploading(true)
    setUploadError('')
    setUploadResult(null)

    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result.split(',')[1])
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const response = await fetch('/api/extract-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfBase64: base64, filename: file.name })
      })

      const data = await response.json()

      if (data.error) {
        setUploadError(data.error)
        setUploading(false)
        return
      }

      if (!data.foods || data.foods.length === 0) {
        setUploadError('No food data found in this PDF.')
        setUploading(false)
        return
      }

      setUploadResult({ filename: file.name, foods: data.foods })
    } catch (err) {
      setUploadError('Failed to process PDF: ' + err.message)
    }

    setUploading(false)
  }

  async function saveExtractedFoods() {
    if (!uploadResult) return
    setSaving(true)

    const toInsert = uploadResult.foods.map(f => ({
      name: f.name,
      category: f.category || 'Other',
      calories: parseFloat(f.calories) || 0,
      protein: parseFloat(f.protein) || 0,
      carbs: parseFloat(f.carbs) || 0,
      fats: parseFloat(f.fats) || 0,
      per_grams: f.per_grams || 100,
      source: uploadResult.filename
    }))

    const { error } = await supabase.from('foods').insert(toInsert)

    if (error) {
      setUploadError('Save failed: ' + error.message)
    } else {
      setUploadResult(null)
      loadFoods()
    }

    setSaving(false)
  }

  async function deleteFood(id) {
    await supabase.from('foods').delete().eq('id', id)
    setFoods(foods.filter(f => f.id !== id))
  }

  async function addManualFood(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('foods').insert({
      name: form.name,
      category: form.category,
      calories: parseFloat(form.calories) || 0,
      protein: parseFloat(form.protein) || 0,
      carbs: parseFloat(form.carbs) || 0,
      fats: parseFloat(form.fats) || 0,
      per_grams: 100,
      source: 'Manual'
    })
    if (!error) {
      setShowAddModal(false)
      setForm({ name: '', category: 'Protein', calories: '', protein: '', carbs: '', fats: '' })
      loadFoods()
    }
    setSaving(false)
  }

  const filtered = foods.filter(f => {
    const matchCat = categoryFilter === 'All' || f.category === categoryFilter
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Food Library</div>
          <div className="page-sub">{foods.length} foods · used in AI meal plan generation</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
          <i className="ti ti-plus"></i>Add food
        </button>
      </div>

      {/* PDF Upload */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="section-label">Import from PDF</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 12 }}>
          Upload a nutrition info sheet, food label doc, or meal template PDF. Claude will extract all food data automatically.
        </div>
        <input
          type="file"
          accept="application/pdf"
          onChange={handlePDFUpload}
          disabled={uploading}
          style={{ fontSize: 13, marginBottom: 8 }}
          id="pdf-upload"
        />
        {uploading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text2)', fontSize: 13, marginTop: 8 }}>
            <i className="ti ti-loader" style={{ animation: 'spin 1s linear infinite' }}></i>
            Reading PDF and extracting food data...
          </div>
        )}
        {uploadError && <div className="error-msg" style={{ marginTop: 8 }}>{uploadError}</div>}

        {uploadResult && (
          <div style={{ marginTop: 12, background: 'var(--bg3)', borderRadius: 'var(--radius)', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ fontWeight: 500 }}>{uploadResult.foods.length} foods found in {uploadResult.filename}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 2 }}>Review below then save to your library</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" onClick={() => setUploadResult(null)}>Discard</button>
                <button className="btn btn-primary" onClick={saveExtractedFoods} disabled={saving}>
                  {saving ? 'Saving...' : <><i className="ti ti-check"></i>Save all to library</>}
                </button>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {uploadResult.foods.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'var(--bg4)', borderRadius: 'var(--radius)' }}>
                  <div style={{ flex: 1, fontWeight: 500, fontSize: 13 }}>{f.name}</div>
                  <span className="badge" style={{ background: 'var(--bg3)', color: 'var(--text2)' }}>{f.category}</span>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{f.calories} kcal</div>
                  <div style={{ fontSize: 12, color: 'var(--blue)' }}>{f.protein}g P</div>
                  <div style={{ fontSize: 12, color: 'var(--amber)' }}>{f.carbs}g C</div>
                  <div style={{ fontSize: 12, color: 'var(--green)' }}>{f.fats}g F</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search & filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <input
          placeholder="Search foods..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ maxWidth: 260 }}
        />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={'btn btn-sm' + (categoryFilter === cat ? ' btn-primary' : '')}
              onClick={() => setCategoryFilter(cat)}
            >{cat}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="empty-state">
          <i className="ti ti-leaf"></i>
          {foods.length === 0 ? 'No foods yet. Upload a PDF or add manually.' : 'No foods match your filter.'}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {filtered.map(f => (
          <div key={f.id} className="meal-row">
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 500, fontSize: 13 }}>{f.name}</div>
              {f.source && f.source !== 'Manual' && <div style={{ fontSize: 11, color: 'var(--text3)' }}>From: {f.source}</div>}
            </div>
            <span className="badge" style={{ background: 'var(--bg4)', color: 'var(--text2)', marginRight: 8 }}>{f.category}</span>
            <div className="meal-macro">{f.calories}<span style={{ color: 'var(--text3)' }}> cal</span></div>
            <div className="meal-macro">{f.protein}g<span style={{ color: 'var(--text3)' }}> P</span></div>
            <div className="meal-macro">{f.carbs}g<span style={{ color: 'var(--text3)' }}> C</span></div>
            <div className="meal-macro">{f.fats}g<span style={{ color: 'var(--text3)' }}> F</span></div>
            <button className="btn btn-danger btn-sm" onClick={() => deleteFood(f.id)}>
              <i className="ti ti-x"></i>
            </button>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Add food manually</div>
            <form onSubmit={addManualFood}>
              <div className="field-row"><div className="field-label">Food name</div><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Chicken breast" required /></div>
              <div className="field-row">
                <div className="field-label">Category</div>
                <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                  {['Protein', 'Carbs', 'Fats', 'Veg', 'Dairy', 'Other'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 10 }}>Per 100g</div>
              <div className="grid2" style={{ marginBottom: 8 }}>
                <div className="field-row" style={{ marginBottom: 0 }}><div className="field-label">Calories</div><input type="number" value={form.calories} onChange={e => setForm({ ...form, calories: e.target.value })} placeholder="165" /></div>
                <div className="field-row" style={{ marginBottom: 0 }}><div className="field-label">Protein (g)</div><input type="number" value={form.protein} onChange={e => setForm({ ...form, protein: e.target.value })} placeholder="31" /></div>
              </div>
              <div className="grid2" style={{ marginBottom: 16 }}>
                <div className="field-row" style={{ marginBottom: 0 }}><div className="field-label">Carbs (g)</div><input type="number" value={form.carbs} onChange={e => setForm({ ...form, carbs: e.target.value })} placeholder="0" /></div>
                <div className="field-row" style={{ marginBottom: 0 }}><div className="field-label">Fats (g)</div><input type="number" value={form.fats} onChange={e => setForm({ ...form, fats: e.target.value })} placeholder="3.6" /></div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Add food'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
