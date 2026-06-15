import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Clients from './pages/Clients'
import ClientDetail from './pages/ClientDetail'
import MealPlans from './pages/MealPlans'
import MealPlanDetail from './pages/MealPlanDetail'
import Reports from './pages/Reports'
import Generator from './pages/Generator'
import FoodLibrary from './pages/FoodLibrary'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div className="loading">Loading...</div>

  if (!session) return <Login />

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout session={session} />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="clients" element={<Clients />} />
          <Route path="clients/:id" element={<ClientDetail />} />
          <Route path="meals" element={<MealPlans />} />
          <Route path="meals/:id" element={<MealPlanDetail />} />
          <Route path="reports" element={<Reports />} />
          <Route path="generator" element={<Generator />} />
          <Route path="food-library" element={<FoodLibrary />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
