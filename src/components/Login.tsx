import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { FormEvent } from 'react'
import { FiArrowRight, FiBarChart2, FiLock } from 'react-icons/fi'
import { demoCredentials } from '../data/demo'

export default function Login({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (email.trim().toLowerCase() !== demoCredentials.email || password !== demoCredentials.password) {
      setError('Email or password is incorrect. Use the demo credentials below.')
      return
    }
    onLogin()
  }
  return <main className="login-layout">
    <section className="login-story"><Link className="brand" to="/login"><span className="brand-icon"><FiBarChart2 /></span> Balance<span className="brand-dot">.</span></Link>
      <div><span className="eyebrow">YOUR MONEY, MADE CLEAR</span><h1>A little clarity.<br />A better balance.</h1><p>See what comes in, understand what goes out, and make room for what matters.</p>
        <div className="preview-card"><span>YOUR MONTH AT A GLANCE</span><strong>₹40,000<span>left to make plans with</span></strong><div className="preview-bars">{[42, 65, 49, 82, 62, 100, 76].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div><small>Illustrative demo data</small></div>
      </div><small>A simpler view of your everyday finances.</small>
    </section>
    <section className="login-panel"><div className="login-form"><span className="pill"><FiLock /> Demo workspace</span><h2>Welcome back</h2><p className="muted">Sign in to see your financial picture.</p>
      <form onSubmit={submit}><label htmlFor="email">Email address</label><input id="email" type="email" autoComplete="username" placeholder="you@example.com" required value={email} onChange={(event) => { setEmail(event.target.value); setError('') }} />
        <label htmlFor="password">Password</label><input id="password" type="password" autoComplete="current-password" placeholder="Enter your password" required value={password} onChange={(event) => { setPassword(event.target.value); setError('') }} />
        {error && <p className="form-error" role="alert">{error}</p>}<button className="primary" type="submit">Sign in to dashboard <FiArrowRight /></button>
      </form><p className="muted" style={{ marginTop: 18 }}>New here? <Link to="/signup">Create an account</Link></p><div className="demo-box"><strong>Take a look around</strong><p>Email: <code>{demoCredentials.email}</code><br />Password: <code>{demoCredentials.password}</code></p><button type="button" onClick={() => { setEmail(demoCredentials.email); setPassword(demoCredentials.password); setError('') }}>Fill demo credentials <FiArrowRight /></button></div><p className="login-note">Demo access only. No bank account or real financial data is connected.</p>
    </div></section>
  </main>
}
