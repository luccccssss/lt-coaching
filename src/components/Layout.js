import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Layout({ session }) {
  const navigate = useNavigate()

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  return (
    <div className="app">
      <div className="sidebar">
        <div className="sidebar-logo">LT <span>Coaching</span></div>
        <NavLink to="/dashboard" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <i className="ti ti-layout-dashboard"></i>Dashboard
        </NavLink>
        <NavLink to="/clients" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <i className="ti ti-users"></i>Clients
        </NavLink>
        <NavLink to="/meals" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <i className="ti ti-salad"></i>Meal Plans
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
          <i className="ti ti-file-text"></i>Reports
        </NavLink>
        <div style={{ flex: 1 }} />
        <div style={{ padding: '0 16px 8px', fontSize: 12, color: 'var(--text3)' }}>
          {session.user.email}
        </div>
        <button className="nav-item" onClick={handleLogout} style={{ color: 'var(--text3)' }}>
          <i className="ti ti-logout"></i>Log out
        </button>
      </div>
      <div className="main">
        <Outlet />
      </div>
    </div>
  )
}
