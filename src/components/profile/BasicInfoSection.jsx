import { useState, useEffect } from 'react'
import { useVerification } from '../../hooks/useVerification'
import { supabase } from '../../lib/supabase'
import VerificationRequestModal from '../VerificationRequestModal'

const COLORS = ['#4a4e69', '#9a8c98', '#c9ada7', '#22223b', '#e76f51', '#2a9d8f']

const NATIONALITIES = [
  'India', 'United Arab Emirates', 'United States', 'United Kingdom', 'Canada',
  'Australia', 'Pakistan', 'Bangladesh', 'Nepal', 'Sri Lanka', 'Saudi Arabia', 'Other',
]

function splitName(fullName) {
  const parts = (fullName || '').trim().split(/\s+/)
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') }
}

export default function BasicInfoSection({ user, showToast }) {
  const { profile, isVerified, isPending, requestVerification } = useVerification(user)
  const [form, setForm] = useState({
    firstName: '', lastName: '', city: '', phone: '',
    dateOfBirth: '', nationality: '', gender: '',
  })
  const [saving, setSaving] = useState(false)
  const [verifyModalOpen, setVerifyModalOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#4a4e69')

  const isGoogleUser = !!user?.email && !user?.phone
  const displayPhone = user?.phone || form.phone

  useEffect(() => {
    if (!user) return
    const googleName = user?.user_metadata?.full_name || user?.user_metadata?.name || ''
    if (profile) {
      const { firstName, lastName } = splitName(profile.full_name || googleName)
      setForm({
        firstName, lastName,
        city: profile.city ?? '',
        phone: profile.phone ?? user?.phone ?? '',
        dateOfBirth: profile.date_of_birth ?? '',
        nationality: profile.nationality ?? '',
        gender: profile.gender ?? '',
      })
      setSelectedColor(profile.avatar_color ?? '#4a4e69')
    } else {
      const { firstName, lastName } = splitName(googleName)
      setForm({
        firstName, lastName, city: '', phone: user?.phone ?? '',
        dateOfBirth: '', nationality: '', gender: '',
      })
    }
  }, [user, profile])

  function set(key) {
    return e => setForm(f => ({ ...f, [key]: e.target.value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)

    const payload = {
      full_name: [form.firstName, form.lastName].filter(Boolean).join(' '),
      city: form.city,
      phone: displayPhone,
      email: user.email ?? null,
      avatar_color: selectedColor,
      date_of_birth: form.dateOfBirth || null,
      nationality: form.nationality || null,
      gender: form.gender || null,
    }

    const { error } = await supabase.from('profiles').upsert({ id: user.id, ...payload })

    setSaving(false)
    if (error) {
      showToast(error.message || 'Failed to save profile', '✕')
      console.error('Profile save error:', error)
    } else {
      showToast('Profile saved! ✓', '✓')
    }
  }

  async function handleVerifyDocs(docs) {
    const { error } = await requestVerification({ full_name: [form.firstName, form.lastName].filter(Boolean).join(' '), ...docs })
    if (error) { showToast("Couldn't send request — try again later", '✕'); throw error }
    showToast('Verification request sent!', '✓')
  }

  const initials = (form.firstName || form.lastName)
    ? `${form.firstName[0] || ''}${form.lastName[0] || ''}`.toUpperCase()
    : (user?.user_metadata?.full_name?.[0] || user?.email?.[0] || user?.phone?.[2] || '?').toUpperCase()

  return (
    <>
      {/* ── Identity card ── */}
      <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e5e7eb', padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: selectedColor, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, color: '#fff', fontWeight: 700,
          }}>
            {user?.user_metadata?.avatar_url
              ? <img src={user.user_metadata.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : initials}
          </div>

          <div style={{ flex: 1, minWidth: 160 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 17, fontWeight: 800, color: '#1a1a2e' }}>
                {[form.firstName, form.lastName].filter(Boolean).join(' ') || 'Your name'}
              </span>
              {isVerified && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', borderRadius: 99, padding: '2px 9px', fontSize: 10.5, fontWeight: 700 }}>
                  ✓ VERIFIED USER
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setSelectedColor(c)} style={{
                  width: 18, height: 18, borderRadius: '50%', background: c, border: 'none',
                  cursor: 'pointer', outline: selectedColor === c ? '2px solid #1a1a2e' : 'none', outlineOffset: 2,
                }} />
              ))}
            </div>
          </div>
        </div>

        {/* Verification status banner */}
        {isVerified ? (
          <div style={{ marginTop: 16, background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12.5, color: '#92400e' }}>
              Your verification will expire on{' '}
              <strong>{new Date(profile.verified_until).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
            </span>
            <button onClick={() => setVerifyModalOpen(true)} style={{ fontSize: 12, fontWeight: 700, color: '#1d3a6e', background: 'none', border: 'none', cursor: 'pointer' }}>
              Renew Verification →
            </button>
          </div>
        ) : (
          <div style={{ marginTop: 16, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12.5, color: '#1e40af' }}>
              {isPending ? 'Your verification request is pending review.' : 'Not verified yet — build trust with buyers.'}
            </span>
            {!isPending && (
              <button onClick={() => setVerifyModalOpen(true)} style={{ fontSize: 12, fontWeight: 700, color: '#1d3a6e', background: 'none', border: 'none', cursor: 'pointer' }}>
                Get Verified →
              </button>
            )}
          </div>
        )}
      </div>

      {verifyModalOpen && (
        <VerificationRequestModal
          user={user}
          onClose={() => setVerifyModalOpen(false)}
          onSubmit={handleVerifyDocs}
          showToast={showToast}
        />
      )}

      <form onSubmit={handleSave}>
        <Section title="Profile Name" subtitle="This is displayed on your profile">
          <Row>
            <Field label="First Name">
              <input value={form.firstName} onChange={set('firstName')} placeholder="First name" style={inputStyle} />
            </Field>
            <Field label="Last Name">
              <input value={form.lastName} onChange={set('lastName')} placeholder="Last name" style={inputStyle} />
            </Field>
          </Row>
        </Section>

        <Section title="Contact" subtitle="How buyers and BazaarTrade can reach you">
          {isGoogleUser && (
            <Field label="Google Account">
              <input value={user.email} disabled style={{ ...inputStyle, opacity: 0.5 }} />
            </Field>
          )}
          <Field label={`Mobile Number${isGoogleUser ? ' (optional)' : ''}`}>
            {isGoogleUser ? (
              <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 XXXXX XXXXX" style={inputStyle} />
            ) : (
              <input value={user?.phone ?? ''} disabled style={{ ...inputStyle, opacity: 0.5 }} />
            )}
          </Field>
          <Field label="City">
            <input value={form.city} onChange={set('city')} placeholder="e.g. Mumbai" style={inputStyle} />
          </Field>
        </Section>

        <Section title="Account Details" subtitle="This is not visible to other users">
          <Row>
            <Field label="Date of Birth">
              <input type="date" value={form.dateOfBirth} onChange={set('dateOfBirth')} style={inputStyle} />
            </Field>
            <Field label="Nationality">
              <select value={form.nationality} onChange={set('nationality')} style={{ ...inputStyle, background: '#fff' }}>
                <option value="">Select…</option>
                {NATIONALITIES.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </Field>
          </Row>
          <Field label="Gender">
            <div style={{ display: 'flex', gap: 20, marginTop: 4 }}>
              {['Male', 'Female', 'Prefer not to say'].map(g => (
                <label key={g} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13.5, color: '#374151', cursor: 'pointer' }}>
                  <input type="radio" name="gender" checked={form.gender === g} onChange={() => setForm(f => ({ ...f, gender: g }))} />
                  {g}
                </label>
              ))}
            </div>
          </Field>
        </Section>

        <button type="submit" disabled={saving} style={{
          padding: '13px 32px', borderRadius: 99, background: '#1a1a2e', color: '#fff',
          border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700,
        }}>
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 9,
  border: '1.5px solid #e5e7eb', fontSize: 13.5, outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit', color: '#1a1a2e',
}

function Section({ title, subtitle, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e5e7eb', padding: 20, marginBottom: 16 }}>
      <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1a1a2e', margin: '0 0 2px' }}>{title}</h3>
      <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 16px' }}>{subtitle}</p>
      {children}
    </div>
  )
}

function Row({ children }) {
  return <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>{children}</div>
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 14, flex: '1 1 200px', minWidth: 0 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>{label}</label>
      {children}
    </div>
  )
}
