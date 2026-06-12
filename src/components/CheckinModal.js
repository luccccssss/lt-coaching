import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { navyBF, bfCategory } from '../lib/utils'

export default function CheckinModal({ client, nextWeek, onClose, onSave }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '', height: '', waist: '', neck: '', hips: '', notes: ''
  })
  const [photo, setPhoto] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const bf = navyBF(client.gender, form.height, form.waist, form.neck, client.gender === 'female' ? form.hips : null)

  function handlePhoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setPhoto(file)
    const reader = new FileReader()
    reader.onload = ev => setPhotoPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!form.weight) return
    setSaving(true)

    let photo_url = null
    if (photo) {
      const ext = photo.name.split('.').pop()
      const path = `${client.id}/week-${nextWeek}-${Date.now()}.${ext}`
      const { data: upload } = await supabase.storage.from('progress-photos').upload(path, photo)
      if (upload) {
        const { data: { publicUrl } } = supabase.storage.from('progress-photos').getPublicUrl(path)
        photo_url = publicUrl
      }
    }

    await supabase.from('checkins').insert({
      client_id: client.id,
      week: nextWeek,
      date: form.date,
      weight: parseFloat(form.weight),
      height: parseFloat(form.height) || null,
      waist: parseFloat(form.waist) || null,
      neck: parseFloat(form.neck) || null,
      hips: client.gender === 'female' ? (parseFloat(form.hips) || null) : null,
      bf: bf,
      notes: form.notes,
      photo_url
    })

    setSaving(false)
    onSave()
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-title">Log check-in — Week {nextWeek}</div>
        <form onSubmit={handleSave}>
          <div className="grid2" style={{ marginBottom: 14 }}>
            <div className="field-row" style={{ marginBottom: 0 }}><div className="field-label">Date</div><input type="date" value={form.date} onChange={e => set('date', e.target.value)} /></div>
            <div className="field-row" style={{ marginBottom: 0 }}><div className="field-label">Weight (kg)</div><input type="number" step="0.1" value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="70.0" required /></div>
          </div>

          <div className="section-label">Measurements — US Navy BF%</div>
          <div className="field-row"><div className="field-label">Height (cm)</div><input type="number" step="0.1" value={form.height} onChange={e => set('height', e.target.value)} placeholder="175" /></div>
          <div className="grid2" style={{ marginBottom: client.gender === 'female' ? 8 : 14 }}>
            <div className="field-row" style={{ marginBottom: 0 }}><div className="field-label">Waist (at navel)</div><input type="number" step="0.1" value={form.waist} onChange={e => set('waist', e.target.value)} placeholder="80" /></div>
            <div className="field-row" style={{ marginBottom: 0 }}><div className="field-label">Neck</div><input type="number" step="0.1" value={form.neck} onChange={e => set('neck', e.target.value)} placeholder="38" /></div>
          </div>
          {client.gender === 'female' && (
            <div className="field-row"><div className="field-label">Hips (widest point)</div><input type="number" step="0.1" value={form.hips} onChange={e => set('hips', e.target.value)} placeholder="95" /></div>
          )}

          <div style={{ background: 'var(--bg4)', borderRadius: 'var(--radius)', padding: '12px 16px', textAlign: 'center', marginBottom: 16 }}>
            {bf != null ? (
              <>
                <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--accent)' }}>{bf}%</div>
                <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{bfCategory(bf, client.gender)}</div>
              </>
            ) : (
              <div style={{ color: 'var(--text3)', fontSize: 13 }}>Fill in measurements to calculate BF%</div>
            )}
          </div>

          <div className="section-label">Progress photo</div>
          <input type="file" accept="image/*" onChange={handlePhoto} style={{ fontSize: 12, padding: '6px', marginBottom: 8 }} />
          {photoPreview && <img src={photoPreview} alt="Preview" style={{ height: 80, borderRadius: 'var(--radius)', objectFit: 'cover', display: 'block', marginBottom: 12 }} />}

          <div className="field-row" style={{ marginTop: 4 }}><div className="field-label">Notes</div><textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows="2" placeholder="Sleep, adherence, how client felt..." /></div>

          <div className="modal-footer">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save check-in'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
