import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'

function getName(user) {
  return user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Anonymous'
}

export default function VerifiedBanner() {
  const { user, setLoginOpen, showToast } = useApp()
  const [profile, setProfile] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!user?.id) { setProfile(null); return }
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      .then(({ data }) => setProfile(data))
  }, [user?.id])

  const isVerified = profile?.verified_until && new Date(profile.verified_until) > new Date()
  const isPending = profile?.verification_requested_at && !isVerified

  async function handleClick() {
    if (!user) { setLoginOpen(true); return }
    if (isVerified) {
      showToast(`You're verified until ${new Date(profile.verified_until).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`, '✓')
      return
    }
    if (isPending) {
      showToast('Your verification request is pending review', 'ℹ️')
      return
    }
    setSubmitting(true)
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: getName(user),
      verification_requested_at: new Date().toISOString(),
    })
    setSubmitting(false)
    if (error) { showToast("Couldn't send request — try again later", '✕'); return }
    setProfile(p => ({ ...(p || {}), verification_requested_at: new Date().toISOString() }))
    showToast('Request sent! Our team will review it shortly.', '✓')
  }

  const buttonLabel = isVerified ? 'Verified ✓' : isPending ? 'Pending review' : submitting ? 'Sending…' : 'Get Started'

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      background: 'linear-gradient(135deg,#eff6ff,#f0f7ff)',
      border: '1px solid #bfdbfe', borderRadius: 14,
      padding: '16px 20px', marginBottom: 28,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
        background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(29,58,110,0.12)',
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#1d4ed8">
          <path d="M12 1l2.39 2.42 3.4-.24.24 3.4L21 8.97l-1.63 3.03L21 15.03l-2.97 1.39-.24 3.4-3.4-.24L12 22l-2.39-2.42-3.4.24-.24-3.4L3 15.03l1.63-3.03L3 8.97l2.97-1.39.24-3.4 3.4.24z"/>
          <path d="M9.5 12.2l1.8 1.8 3.2-3.6" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 15, fontWeight: 800, color: '#1a1a2e' }}>
          {isVerified ? "You're a verified seller" : 'Got a verified badge yet?'}
        </span>
        {!isVerified && (
          <span style={{ fontSize: 13, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 10 }}>
            Get more visibility <span style={{ color: '#bfdbfe' }}>|</span> Enhance your credibility
          </span>
        )}
      </div>

      <button
        onClick={handleClick}
        disabled={submitting || isPending}
        style={{
          flexShrink: 0, padding: '10px 22px', borderRadius: 10,
          border: 'none', background: isVerified ? '#059669' : '#fff',
          color: isVerified ? '#fff' : '#1a1a2e',
          fontSize: 13.5, fontWeight: 700,
          cursor: (submitting || isPending) ? 'default' : 'pointer',
          boxShadow: isVerified ? 'none' : '0 1px 4px rgba(0,0,0,0.08)',
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {buttonLabel}
      </button>
    </div>
  )
}
