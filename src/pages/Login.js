import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ width: '100%', maxWidth: 360 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 24, fontWeight: 600, color: 'var(--accent)' }}>LT <span style={{ color: 'var(--text2)', fontWeight: 400 }}>Coaching</span></div>
          <div style={{ fontSize: 13, color: 'var(--text2)', marginTop: 6 }}>Coach dashboard</div>
        </div>
        <div className="card">
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleLogin}>
            <div className="field-row">
              <div className="field-label">Email</div>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" required />
            </div>
            <div className="field-row">
              <div className="field-label">Password</div>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
