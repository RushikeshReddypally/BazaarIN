import { useState } from 'react'
import { useApp } from '../context/AppContext'

const emptyForm = { name: '', phone: '', password: '' }

export default function LoginModal() {
  const { loginOpen, setLoginOpen, showToast } = useApp()
  const [tab, setTab] = useState('login')
  const [form, setForm] = useState(emptyForm)

  function set(key) {
    return e => setForm(f => ({ ...f, [key]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setLoginOpen(false)
    setForm(emptyForm)
    showToast(tab === 'login' ? 'Welcome back! 👋' : 'Account created! 🎉', '✓')
  }

  function close() { setLoginOpen(false) }

  return (
    <div className={`overlay${loginOpen ? ' open' : ''}`} onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal">
        <button className="modal-x" onClick={close}>✕</button>

        <div className="modal-logo">Bazaar<span className="nav-logo-dot" />IN</div>
        <p className="modal-sub">
          {tab === 'login' ? 'Welcome back! Sign in to continue.' : 'Create your free account.'}
        </p>

        <div className="tab-row">
          <button className={`tab${tab === 'login' ? ' on' : ''}`} onClick={() => setTab('login')}>Sign In</button>
          <button className={`tab${tab === 'register' ? ' on' : ''}`} onClick={() => setTab('register')}>Register</button>
        </div>

        <form onSubmit={handleSubmit}>
          {tab === 'register' && (
            <div className="fr">
              <label>Full Name</label>
              <input value={form.name} onChange={set('name')} placeholder="Your full name" required />
            </div>
          )}
          <div className="fr">
            <label>Mobile Number</label>
            <input value={form.phone} onChange={set('phone')} placeholder="+91 XXXXX XXXXX" required />
          </div>
          <div className="fr">
            <label>Password</label>
            <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" required />
          </div>
          <button type="submit" className="fr-submit">
            {tab === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="divider">or continue with</div>
        <div className="social-btns">
          <button className="social-btn" onClick={() => { close(); showToast('Google sign-in coming soon!', 'G') }}>
            G &nbsp;Google
          </button>
          <button className="social-btn" onClick={() => { close(); showToast('OTP login coming soon!', '📱') }}>
            📱 &nbsp;OTP
          </button>
        </div>
      </div>
    </div>
  )
}
