import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { initials, goalColor, navyBF, bfCategory, fmtDelta, generateReport } from '../lib/utils'
import ClientModal from '../components/ClientModal'
import CheckinModal from '../components/CheckinModal'
import AssignPlanModal from '../components/AssignPlanModal'

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(null)
  const [checkins, setCheckins] = useState([])
  const [plan, setPlan] = useState(null)
  const [tab, setTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)

  useEffect(() => { loadAll() }, [id])

  async function loadAll() {
    const [{ data: c }, { data: ci }] = await Promise.all([
      supabase.from('clients').select('*').eq('id', id).single(),
      supabase.from('checkins').select('*').eq('client_id', id).order('week', { ascending: true })
    ])
    setClient(c)
    setCheckins(ci || [])
    if (c?.meal_plan_id) {
      const { data: p } = await supabase.from('meal_plans').select('*, meals(*)').eq('id', c.meal_plan_id).single()
      setPlan(p)
    }
    setLoading(false)
  }

  async function handleDelete() {
    if (!window.confirm('Delete this client? This cannot be undone.')) return
    await supabase.from('checkins').delete().eq('client_id', id)
    await supabase.from('clients').delete().eq('id', id)
    navigate('/clients')
  }

  async function removeCheckin(checkinId) {
    await supabase.from('checkins').delete().eq('id', checkinId)
    setCheckins(checkins.filter(c => c.id !== checkinId))
  }

  if (loading) return <div className="loading">Loading...</div>
  if (!client) return <div className="loading">Client not found.</div>

  const last = checkins.length ? checkins[checkins.length - 1] : null
  const prev = checkins.length > 1 ? checkins[checkins.length - 2] : null
  const startW = checkins.length ? checkins[0].weight : client.start_weight
  const curW = last ? last.weight : client.start_weight
  const totalChange = Math.round((curW - startW) * 10) / 10

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/clients')}>
        <i className="ti ti-arrow-left"></i>Back to clients
      </button>

      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="avatar" style={{ width: 48, height: 48, fontSize: 16 }}>{initials(client.name)}</div>
          <div>
            <div className="page-title">{client.name}</div>
            <div className="page-sub">{client.goal} · Week {checkins.length} of {client.weeks}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => setModal('edit')}><i className="ti ti-edit"></i>Edit</button>
          <button className="btn btn-danger" onClick={handleDelete}><i className="ti ti-trash"></i></button>
        </div>
      </div>

      <div className="tab-bar">
        {['overview', 'check-ins', 'nutrition', 'meal plan'].map(t => (
          <button key={t} className={'tab' + (tab === t ? ' active' : '')} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div>
          <div className="grid3" style={{ marginBottom: 16 }}>
            <div className="stat-card">
              <div className="stat-num">{curW}<span style={{ fontSize: 14, color: 'var(--text2)' }}> kg</span></div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>
                Current weight {prev && (() => { const d = fmtDelta(curW, prev.weight, true); return d ? <span style={{ color: d.color }}> {d.text}</span> : null })()}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-num" style={{ color: last?.bf != null ? 'var(--accent)' : 'var(--text3)' }}>
                {last?.bf != null ? `${last.bf}%` : '—'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>Body fat</div>
            </div>
            <div className="stat-card">
              <div className="stat-num" style={{ color: totalChange <= 0 && client.goal === 'Fat loss' ? 'var(--green)' : totalChange >= 0 && client.goal === 'Muscle building' ? 'var(--green)' : 'var(--text)' }}>
                {totalChange > 0 ? '+' : ''}{totalChange}<span style={{ fontSize: 14 }}> kg</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>Total change</div>
            </div>
          </div>

          <div className="grid2" style={{ marginBottom: 16 }}>
            <div className="card">
              <div className="section-label">Progress to goal</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>Start: {client.start_weight} kg</span>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>Target: {client.target_weight} kg</span>
              </div>
              {(() => {
                const total = Math.abs(client.start_weight - client.target_weight)
                const done = Math.abs(curW - client.start_weight)
                const pct = total > 0 ? Math.min(100, Math.round(done / total * 100)) : 0
                return (
                  <>
                    <div className="progress-bar"><div className="progress-fill" style={{ width: pct + '%' }}></div></div>
                    <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6 }}>{pct}% of the way there</div>
                  </>
                )
              })()}
            </div>
            <div className="card">
              <div className="section-label">Program</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>Week {checkins.length} of {client.weeks}</span>
                <span style={{ fontSize: 12, color: 'var(--text2)' }}>{Math.max(0, client.weeks - checkins.length)} left</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: Math.min(100, Math.round(checkins.length / client.weeks * 100)) + '%' }}></div></div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 6 }}>{Math.min(100, Math.round(checkins.length / client.weeks * 100))}% complete</div>
            </div>
          </div>

          {last && (
            <div className="card">
              <div className="section-label">Last check-in — Week {last.week}</div>
              <div className="grid4">
                <div className="checkin-item"><div className="checkin-val">{last.weight} kg</div><div className="checkin-lbl">Weight</div></div>
                {last.bf != null && <div className="checkin-item"><div className="checkin-val">{last.bf}%</div><div className="checkin-lbl">Body fat</div></div>}
                {last.waist && <div className="checkin-item"><div className="checkin-val">{last.waist} cm</div><div className="checkin-lbl">Waist</div></div>}
                {last.neck && <div className="checkin-item"><div className="checkin-val">{last.neck} cm</div><div className="checkin-lbl">Neck</div></div>}
                {last.hips && client.gender === 'female' && <div className="checkin-item"><div className="checkin-val">{last.hips} cm</div><div className="checkin-lbl">Hips</div></div>}
              </div>
              {last.notes && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 10, paddingTop: 10, borderTop: '0.5px solid var(--border)' }}>{last.notes}</div>}
            </div>
          )}

          {client.notes && (
            <div className="card">
              <div className="section-label">Coach notes</div>
              <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{client.notes}</div>
            </div>
          )}
        </div>
      )}

      {tab === 'check-ins' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
            <button className="btn btn-primary" onClick={() => setModal('checkin')}>
              <i className="ti ti-plus"></i>Log check-in
            </button>
          </div>
          {checkins.length === 0 && (
            <div className="empty-state"><i className="ti ti-calendar-stats"></i>No check-ins yet.</div>
          )}
          {[...checkins].reverse().map((ci, i) => {
            const idx = checkins.length - 1 - i
            const prevCi = idx > 0 ? checkins[idx - 1] : null
            const wDelta = prevCi ? fmtDelta(ci.weight, prevCi.weight, true) : null
            const bfDelta = prevCi && prevCi.bf != null && ci.bf != null ? fmtDelta(ci.bf, prevCi.bf, true) : null
            return (
              <div key={ci.id} className="checkin-row">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>Week {ci.week}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {ci.date && <span style={{ fontSize: 11, color: 'var(--text3)' }}>{ci.date}</span>}
                    <button className="btn btn-danger btn-sm" onClick={() => removeCheckin(ci.id)}><i className="ti ti-x"></i></button>
                  </div>
                </div>
                <div className="grid4">
                  <div className="checkin-item">
                    <div className="checkin-val">{ci.weight}<span style={{ fontSize: 11, color: 'var(--text3)' }}> kg</span></div>
                    <div className="checkin-lbl">Weight {wDelta && <span style={{ color: wDelta.color }}>{wDelta.text}</span>}</div>
                  </div>
                  {ci.bf != null && (
                    <div className="checkin-item">
                      <div className="checkin-val">{ci.bf}<span style={{ fontSize: 11, color: 'var(--text3)' }}>%</span></div>
                      <div className="checkin-lbl">BF% {bfDelta && <span style={{ color: bfDelta.color }}>{bfDelta.text}</span>}</div>
                    </div>
                  )}
                  {ci.waist && <div className="checkin-item"><div className="checkin-val">{ci.waist}<span style={{ fontSize: 11, color: 'var(--text3)' }}> cm</span></div><div className="checkin-lbl">Waist</div></div>}
                  {ci.neck && <div className="checkin-item"><div className="checkin-val">{ci.neck}<span style={{ fontSize: 11, color: 'var(--text3)' }}> cm</span></div><div className="checkin-lbl">Neck</div></div>}
                  {ci.hips && client.gender === 'female' && <div className="checkin-item"><div className="checkin-val">{ci.hips}<span style={{ fontSize: 11, color: 'var(--text3)' }}> cm</span></div><div className="checkin-lbl">Hips</div></div>}
                </div>
                {ci.photo_url && (
                  <div style={{ marginTop: 10, paddingTop: 10, borderTop: '0.5px solid var(--border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 6 }}>Progress photo</div>
                    <img src={ci.photo_url} alt="Progress" style={{ height: 100, borderRadius: 'var(--radius)', objectFit: 'cover' }} />
                  </div>
                )}
                {ci.notes && <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 8, paddingTop: 8, borderTop: '0.5px solid var(--border)' }}>{ci.notes}</div>}
              </div>
            )
          })}
        </div>
      )}

      {tab === 'nutrition' && (
        <div className="card">
          <div className="section-label">Daily targets</div>
          <div className="grid4" style={{ marginBottom: 20 }}>
            {[
              [client.calories, 'kcal', 'var(--accent)'],
              [client.protein + 'g', 'protein', 'var(--blue)'],
              [client.carbs + 'g', 'carbs', 'var(--amber)'],
              [client.fats + 'g', 'fats', 'var(--green)']
            ].map(([val, lbl, col]) => (
              <div key={lbl} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 600, color: col }}>{val}</div>
                <div style={{ fontSize: 11, color: 'var(--text2)' }}>{lbl}</div>
              </div>
            ))}
          </div>
          <div className="divider"></div>
          <div className="section-label">Macro split</div>
          {(() => {
            const protCal = client.protein * 4
            const carbCal = client.carbs * 4
            const fatCal = client.fats * 9
            const total = protCal + carbCal + fatCal || 1
            return [
              ['Protein', protCal, 'var(--blue)'],
              ['Carbs', carbCal, 'var(--amber)'],
              ['Fats', fatCal, 'var(--green)']
            ].map(([lbl, cal, col]) => (
              <div key={lbl} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>{lbl}</span>
                  <span style={{ fontSize: 12, color: 'var(--text2)' }}>{Math.round(cal / total * 100)}%</span>
                </div>
                <div className="progress-bar" style={{ height: 6 }}>
                  <div style={{ height: '100%', width: Math.round(cal / total * 100) + '%', background: col, borderRadius: 3 }}></div>
                </div>
              </div>
            ))
          })()}
          <button className="btn" style={{ marginTop: 16, width: '100%', justifyContent: 'center' }} onClick={() => setModal('edit')}>
            <i className="ti ti-edit"></i>Update targets
          </button>
        </div>
      )}

      {tab === 'meal plan' && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="section-label" style={{ marginBottom: 0 }}>Assigned plan</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {plan && <button className="btn btn-sm" onClick={() => navigate(`/meals/${plan.id}`)}><i className="ti ti-eye"></i>View</button>}
              <button className="btn btn-primary btn-sm" onClick={() => setModal('assign')}>
                <i className={`ti ti-${plan ? 'refresh' : 'plus'}`}></i>{plan ? 'Change' : 'Assign'}
              </button>
            </div>
          </div>
          {plan ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <i className="ti ti-salad" style={{ color: 'var(--accent)', fontSize: 18 }}></i>
                <div>
                  <div style={{ fontWeight: 500 }}>{plan.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--text2)' }}>{plan.meals?.length || 0} meals · {(plan.meals || []).reduce((a, m) => a + m.calories, 0)} kcal</div>
                </div>
              </div>
              {(plan.meals || []).map((m, i) => (
                <div key={m.id} className="meal-row">
                  <div style={{ width: 22, height: 22, borderRadius: 4, background: 'var(--bg4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--text3)', flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500 }}>{m.name}</div>
                    {m.foods && <div style={{ fontSize: 11, color: 'var(--text3)' }}>{m.foods}</div>}
                  </div>
                  <div className="meal-macro">{m.calories}<span style={{ color: 'var(--text3)' }}> cal</span></div>
                  <div className="meal-macro">{m.protein}g<span style={{ color: 'var(--text3)' }}> P</span></div>
                </div>
              ))}
            </>
          ) : (
            <div style={{ color: 'var(--text3)', fontSize: 13 }}>No meal plan assigned.</div>
          )}
        </div>
      )}

      {modal === 'edit' && (
        <ClientModal client={client} onClose={() => setModal(null)} onSave={() => { setModal(null); loadAll() }} />
      )}
      {modal === 'checkin' && (
        <CheckinModal client={client} nextWeek={checkins.length + 1} onClose={() => setModal(null)} onSave={() => { setModal(null); loadAll() }} />
      )}
      {modal === 'assign' && (
        <AssignPlanModal client={client} onClose={() => setModal(null)} onSave={() => { setModal(null); loadAll() }} />
      )}
    </div>
  )
}
