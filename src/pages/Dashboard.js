import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { initials, goalColor } from '../lib/utils'

export default function Dashboard() {
  const [clients, setClients] = useState([])
  const [planCount, setPlanCount] = useState(0)
  const [checkinCount, setCheckinCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function load() {
      const [{ data: c }, { count: p }, { count: ci }] = await Promise.all([
        supabase.from('clients').select('*').order('created_at', { ascending: false }),
        supabase.from('meal_plans').select('*', { count: 'exact', head: true }),
        supabase.from('checkins').select('*', { count: 'exact', head: true })
      ])
      setClients(c || [])
      setPlanCount(p || 0)
      setCheckinCount(ci || 0)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="loading">Loading...</div>

  const active = clients.filter(c => c.status === 'active').length

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">LT Coaching overview</div>
        </div>
      </div>

      <div className="grid3" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-num">{active}</div>
          <div className="stat-label">Active clients</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{planCount}</div>
          <div className="stat-label">Meal plans</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{checkinCount}</div>
          <div className="stat-label">Check-ins logged</div>
        </div>
      </div>

      <div className="section-label">Clients</div>
      {clients.length === 0 && (
        <div className="empty-state">
          <i className="ti ti-users"></i>
          No clients yet. Add one in the Clients section.
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {clients.map(c => (
          <div key={c.id} className="client-card" onClick={() => navigate(`/clients/${c.id}`)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="avatar">{initials(c.name)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{c.goal} · {c.calories} kcal · {c.protein}g P</div>
              </div>
              <span className="badge" style={{ background: goalColor(c.goal) + '22', color: goalColor(c.goal) }}>{c.goal}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
