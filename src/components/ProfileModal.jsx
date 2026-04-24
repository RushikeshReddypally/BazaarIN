import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'

const COLORS = ['#4a4e69', '#9a8c98', '#c9ada7', '#22223b', '#e76f51', '#2a9d8f']

export default function ProfileModal() {
  const { profileOpen, setProfileOpen, user, showToast } = useApp()
  const [form, setForm] = useState({ full_name: '', city: '', phone: '' })
  const [saving, setSaving] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#4a4e69')

  const isGoogleUser = !!user?.email && !user?.phone
  const displayPhone = user?.phone || form.phone

  useEffect(() => {
    if (!user || !profileOpen) return
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        const googleName = user?.user_metadata?.full_name || user?.user_metadata?.name || ''
        if (data) {
          setForm({
            full_name: data.full_name || googleName,
            city: data.city ?? '',
            phone: data.phone ?? user?.phone ?? '',
          })
          setSelectedColor(data.avatar_color ?? '#4a4e69')
        } else {
          setForm({
            full_name: googleName,
            city: '',
            phone: user?.phone ?? '',
          })
        }
      })
  }, [user, profileOpen])

  function set(key) {
    return e => setForm(f => ({ ...f, [key]: e.target.value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      full_name: form.full_name,
      city: form.city,
      phone: displayPhone,
      email: user.email ?? null,
      avatar_color: selectedColor,
    })

    setSaving(false)
    if (error) {
      showToast('Failed to save profile', '✕')
    } else {
      setProfileOpen(false)
      showToast('Profile saved! ✓', '✓')
    }
  }

  function close() { setProfileOpen(false) }

  const initials = form.full_name
    ? form.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : (user?.user_metadata?.full_name?.[0] || user?.email?.[0] || user?.phone?.[2] || '?').toUpperCase()

  return (
    <div className={`overlay${profileOpen ? ' open' : ''}`} style={{ zIndex: 1200 }} onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal">
        <button className="modal-x" onClick={close}>✕</button>
        <div className="modal-logo">My Profile</div>
        <p className="modal-sub">Update your details so buyers can reach you.</p>

        {/* Avatar */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: selectedColor,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, color: '#fff', fontWeight: 700,
          }}>
            {user?.user_metadata?.avatar_url
              ? <img src={user.user_metadata.avatar_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : initials}
          </div>
        </div>

        {/* Color picker */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => setSelectedColor(c)} style={{
              width: 24, height: 24, borderRadius: '50%', background: c, border: 'none',
              cursor: 'pointer', outline: selectedColor === c ? '2px solid #1a1a2e' : 'none',
              outlineOffset: 2,
            }} />
          ))}
        </div>

        <form onSubmit={handleSave}>
          {/* Signed in with Google — show email */}
          {isGoogleUser && (
            <div className="fr">
              <label>Google Account</label>
              <input value={user.email} disabled style={{ opacity: 0.5 }} />
            </div>
          )}

          {/* Phone — editable for Google users, locked for phone users */}
          <div className="fr">
            <label>
              Mobile Number
              {isGoogleUser && <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: 11, marginLeft: 6 }}>optional — for easier contact</span>}
            </label>
            {isGoogleUser ? (
              <input
                type="tel"
                value={form.phone}
                onChange={set('phone')}
                placeholder="+91 XXXXX XXXXX"
              />
            ) : (
              <input value={user?.phone ?? ''} disabled style={{ opacity: 0.5 }} />
            )}
          </div>

          <div className="fr">
            <label>Full Name</label>
            <input value={form.full_name} onChange={set('full_name')} placeholder="Your full name" />
          </div>

          <div className="fr">
            <label>City</label>
            <input value={form.city} onChange={set('city')} placeholder="e.g. Mumbai" />
          </div>

          <button type="submit" className="fr-submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
