import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { initials, goalColor } from '../lib/utils'
import ClientModal from '../components/ClientModal'

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { loadClients() }, [])

  async function loadClients() {
    const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false })
    setClients(data || [])
    setLoading(false)
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="page-title">Clients</div>
          <div className="page-sub">{clients.length} total</div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <i className="ti ti-plus"></i>Add client
        </button>
      </div>

      {clients.length === 0 && (
        <div className="empty-state">
          <i className="ti ti-users"></i>
          No clients yet.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {clients.map(c => (
          <div key={c.id} className="client-card" onClick={() => navigate(`/clients/${c.id}`)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="avatar">{initials(c.name)}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text2)' }}>{c.goal} · Week {c.current_week || 0} of {c.weeks}</div>
              </div>
              <span className="badge" style={{ background: goalColor(c.goal) + '22', color: goalColor(c.goal) }}>{c.goal}</span>
              <i className="ti ti-chevron-right" style={{ color: 'var(--text3)' }}></i>
            </div>
            <div style={{ display: 'flex', gap: 20, marginTop: 12, paddingTop: 12, borderTop: '0.5px solid var(--border)' }}>
              {[
                [c.calories, 'kcal'],
                [c.protein + 'g', 'P'],
                [c.carbs + 'g', 'C'],
                [c.fats + 'g', 'F']
              ].map(([val, lbl]) => (
                <div key={lbl} style={{ fontSize: 12, color: 'var(--text2)' }}>
                  {val}<span style={{ color: 'var(--text3)' }}> {lbl}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <ClientModal
          onClose={() => setShowModal(false)}
          onSave={() => { setShowModal(false); loadClients() }}
        />
      )}
    </div>
  )
}
