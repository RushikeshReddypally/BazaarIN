import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'

export default function LoginModal() {
  const { loginOpen, setLoginOpen, showToast, pendingAction, setPendingAction } = useApp()
  const [mode, setMode] = useState('options') // 'options' | 'phone' | 'otp'
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleGoogle() {
    setSubmitting(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) showToast(error.message, '✕')
    setSubmitting(false)
  }

  async function handleSendOtp(e) {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await supabase.auth.signInWithOtp({ phone })
    setSubmitting(false)
    if (error) { showToast(error.message, '✕'); return }
    setMode('otp')
    showToast('OTP sent to your number 📱', '✓')
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    setSubmitting(true)
    const { error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' })
    setSubmitting(false)
    if (error) { showToast(error.message, '✕'); return }
    close()
    showToast('Welcome to BazaarIN! 👋', '✓')
    if (pendingAction) {
      setTimeout(() => { pendingAction(); setPendingAction(null) }, 300)
    }
  }

  function close() {
    setLoginOpen(false)
    setMode('options')
    setPhone('')
    setOtp('')
  }

  return (
    <div className={`overlay${loginOpen ? ' open' : ''}`} style={{ zIndex: 1300 }} onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal">
        <button className="modal-x" onClick={close}>✕</button>

        <div className="modal-logo">Bazaar<span className="nav-logo-dot" />IN</div>

        {mode === 'options' && (
          <>
            <p className="modal-sub">Sign in to buy, sell and chat with sellers across India.</p>

            {/* Google */}
            <button
              onClick={handleGoogle}
              disabled={submitting}
              style={{
                width: '100%', padding: '13px 16px', borderRadius: 10, marginBottom: 12,
                border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                fontSize: 14, fontWeight: 600, color: '#1a1a2e',
                transition: 'box-shadow 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.1)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.5 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.5 7.1 29 5 24 5 13 5 4 14 4 25s9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.6-.4-4.9z"/>
                <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 16.1 19 13 24 13c2.8 0 5.3 1 7.2 2.7l5.7-5.7C33.5 7.1 29 5 24 5 16.3 5 9.7 9 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 45c4.9 0 9.3-1.9 12.7-4.9l-5.9-5c-1.7 1.2-3.8 1.9-6.1 1.9-5.2 0-9.6-3.5-11.2-8.3L6.2 33.9C9.5 40.2 16.2 45 24 45z"/>
                <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l.1-.1 5.9 5C36.8 40 44 35 44 25c0-1.3-.1-2.6-.4-4.9z"/>
              </svg>
              Continue with Google
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
              <span style={{ fontSize: 12, color: '#9ca3af' }}>or</span>
              <div style={{ flex: 1, height: 1, background: '#e5e7eb' }} />
            </div>

            {/* Phone option */}
            <button
              onClick={() => setMode('phone')}
              style={{
                width: '100%', padding: '13px 16px', borderRadius: 10,
                border: '1.5px solid #e5e7eb', background: '#f9fafb', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                fontSize: 14, fontWeight: 600, color: '#1a1a2e',
              }}
            >
              📱 Continue with Mobile OTP
            </button>

            <p style={{ fontSize: 11.5, color: '#9ca3af', textAlign: 'center', marginTop: 16, lineHeight: 1.6 }}>
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </>
        )}

        {mode === 'phone' && (
          <>
            <p className="modal-sub">Enter your mobile number to receive an OTP.</p>
            <button onClick={() => setMode('options')} style={{ background: 'none', border: 'none', color: 'var(--lilac)', cursor: 'pointer', fontSize: 13, marginBottom: 16, padding: 0 }}>
              ← Back
            </button>
            <form onSubmit={handleSendOtp}>
              <div className="fr">
                <label>Mobile Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 XXXXX XXXXX" required />
              </div>
              <button type="submit" className="fr-submit" disabled={submitting}>
                {submitting ? 'Sending OTP…' : 'Send OTP'}
              </button>
            </form>
          </>
        )}

        {mode === 'otp' && (
          <>
            <p className="modal-sub">Enter the OTP sent to {phone}</p>
            <form onSubmit={handleVerifyOtp}>
              <div className="fr">
                <label>Enter OTP</label>
                <input type="text" value={otp} onChange={e => setOtp(e.target.value)} placeholder="6-digit code" maxLength={6} required />
              </div>
              <button type="submit" className="fr-submit" disabled={submitting}>
                {submitting ? 'Verifying…' : 'Verify & Continue'}
              </button>
              <button type="button" style={{ marginTop: 12, width: '100%', background: 'none', border: 'none', color: 'var(--lilac)', cursor: 'pointer', fontSize: 14 }}
                onClick={() => { setMode('phone'); setOtp('') }}>
                ← Change number
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
