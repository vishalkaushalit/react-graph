import { useState } from 'react'
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import Login from './components/Login'
import SignupPage from './components/SignUp'
import Dashboard from './components/Dashboard'
import './App.css'

function AppRoutes() {
  const [loggedIn, setLoggedIn] = useState(() => {
    try { return sessionStorage.getItem('balance.demo-session') === 'active' } catch { return false }
  })
  const navigate = useNavigate()
  const location = useLocation()
  const login = () => {
    setLoggedIn(true)
    try { sessionStorage.setItem('balance.demo-session', 'active') } catch { /* Keep the in-memory session. */ }
    const destination = new URLSearchParams(location.search).get('next')
    navigate(destination && ['/finances', '/finances/add', '/finances/edit'].includes(destination) ? destination : '/dashboard', { replace: true })
  }
  const logout = () => {
    setLoggedIn(false)
    try { sessionStorage.removeItem('balance.demo-session') } catch { /* The in-memory session is cleared. */ }
    navigate('/login', { replace: true })
  }
  const dashboard = loggedIn ? <Dashboard onLogout={logout} /> : <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />
  return <Routes>
    <Route path="/" element={<Navigate to={loggedIn ? '/dashboard' : '/login'} replace />} />
    <Route path="/login" element={loggedIn ? <Navigate to="/dashboard" replace /> : <Login onLogin={login} />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/dashboard" element={dashboard} />
    <Route path="/finances" element={dashboard} />
    <Route path="/finances/add" element={dashboard} />
    <Route path="/finances/edit" element={dashboard} />
    <Route path="*" element={<main className="dashboard-content"><h1>Page not found</h1><p className="muted">This address does not match a page.</p><Link className="logout" to="/">Go home</Link></main>} />
  </Routes>
}

export default function App() {
  return <BrowserRouter><AppRoutes /></BrowserRouter>
}
