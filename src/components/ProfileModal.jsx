import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'

const COLORS = ['#4a4e69', '#9a8c98', '#c9ada7', '#22223b', '#e76f51', '#2a9d8f']

export default function ProfileModal() {
  const { profileOpen, setProfileOpen, user, showToast } = useApp()
  const [form, setForm] = useState({ full_name: '', city: '' })
  const [saving, setSaving] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#4a4e69')

  useEffect(() => {
    if (!user || !profileOpen) return

    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setForm({ full_name: data.full_name ?? '', city: data.city ?? '' })
          setSelectedColor(data.avatar_color ?? '#4a4e69')
        }
      })
  }, [user, profileOpen])

  function set(key) {
    return e => setForm(f => ({ ...f, [key]: e.target.value }))
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)

    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: form.full_name,
        city: form.city,
        phone: user.phone,
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
    : (user?.phone ?? '?').replace('+', '').slice(0, 2)

  return (
    <div className={`overlay${profileOpen ? ' open' : ''}`} onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal">
        <button className="modal-x" onClick={close}>✕</button>

        <div className="modal-logo">My Profile</div>
        <p className="modal-sub">Update your name and city so buyers can reach you.</p>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: selectedColor, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 22, color: '#fff', fontWeight: 700,
          }}>
            {initials}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginBottom: 24 }}>
          {COLORS.map(c => (
            <button
              key={c}
              onClick={() => setSelectedColor(c)}
              style={{
                width: 24, height: 24, borderRadius: '50%', background: c, border: 'none',
                cursor: 'pointer', outline: selectedColor === c ? '2px solid #000' : 'none',
                outlineOffset: 2,
              }}
            />
          ))}
        </div>

        <form onSubmit={handleSave}>
          <div className="fr">
            <label>Mobile Number</label>
            <input value={user?.phone ?? ''} disabled style={{ opacity: 0.5 }} />
          </div>
          <div className="fr">
            <label>Full Name</label>
            <input
              value={form.full_name}
              onChange={set('full_name')}
              placeholder="Your full name"
            />
          </div>
          <div className="fr">
            <label>City</label>
            <input
              value={form.city}
              onChange={set('city')}
              placeholder="e.g. Mumbai"
            />
          </div>
          <button type="submit" className="fr-submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  )
}
