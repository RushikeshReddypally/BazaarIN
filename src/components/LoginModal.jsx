import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'

export default function LoginModal() {
  const { loginOpen, setLoginOpen, showToast } = useApp()
  const [step, setStep] = useState('phone') // 'phone' | 'otp'
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSendOtp(e) {
    e.preventDefault()
    setSubmitting(true)

    const { error } = await supabase.auth.signInWithOtp({ phone })

    setSubmitting(false)

    if (error) {
      showToast(error.message, '✕')
    } else {
      setStep('otp')
      showToast('OTP sent to your number 📱', '✓')
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault()
    setSubmitting(true)

    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    })

    setSubmitting(false)

    if (error) {
      showToast(error.message, '✕')
    } else {
      close()
      showToast('Welcome to BazaarIN! 👋', '✓')
    }
  }

  function close() {
    setLoginOpen(false)
    setStep('phone')
    setPhone('')
    setOtp('')
  }

  return (
    <div className={`overlay${loginOpen ? ' open' : ''}`} onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal">
        <button className="modal-x" onClick={close}>✕</button>

        <div className="modal-logo">Bazaar<span className="nav-logo-dot" />IN</div>
        <p className="modal-sub">
          {step === 'phone'
            ? 'Enter your mobile number to continue.'
            : `Enter the OTP sent to ${phone}`}
        </p>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp}>
            <div className="fr">
              <label>Mobile Number</label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                required
              />
            </div>
            <button type="submit" className="fr-submit" disabled={submitting}>
              {submitting ? 'Sending OTP…' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <div className="fr">
              <label>Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="6-digit code"
                maxLength={6}
                required
              />
            </div>
            <button type="submit" className="fr-submit" disabled={submitting}>
              {submitting ? 'Verifying…' : 'Verify & Continue'}
            </button>
            <button
              type="button"
              style={{ marginTop: 12, width: '100%', background: 'none', border: 'none', color: 'var(--lilac)', cursor: 'pointer', fontSize: 14 }}
              onClick={() => { setStep('phone'); setOtp('') }}
            >
              ← Change number
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
