import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function SecuritySection({ user, deleteAccount, showToast }) {
  const [signingOut, setSigningOut] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSignOutEverywhere() {
    setSigningOut(true)
    const { error } = await supabase.auth.signOut({ scope: 'others' })
    setSigningOut(false)
    showToast(error ? 'Failed to sign out other devices' : 'Signed out of all other devices', error ? '✕' : '✓')
  }

  async function handleDelete() {
    setDeleting(true)
    await deleteAccount()
    setDeleting(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e5e7eb', padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1a1a2e', margin: '0 0 16px' }}>Account</h3>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>Email</label>
          <input value={user?.email || 'No email on this account'} disabled style={{
            width: '100%', padding: '10px 12px', borderRadius: 9, border: '1.5px solid #e5e7eb',
            fontSize: 13.5, boxSizing: 'border-box', color: '#6b7280', background: '#f9fafb',
          }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f9fafb', borderRadius: 10 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>Signed in on other devices?</div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>This won't sign out your current session</div>
          </div>
          <button
            onClick={handleSignOutEverywhere} disabled={signingOut}
            style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 12.5, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
          >
            {signingOut ? 'Signing out…' : 'Sign out everywhere else'}
          </button>
        </div>
      </div>

      <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #fecaca', padding: 20 }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#991b1b', margin: '0 0 6px' }}>Danger Zone</h3>
        <p style={{ fontSize: 12.5, color: '#6b7280', marginBottom: 14 }}>
          Permanently deletes your account, listings, messages, and saved data. This cannot be undone.
        </p>
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            style={{ padding: '10px 20px', borderRadius: 9, border: '1.5px solid #fca5a5', background: '#fff5f5', color: '#dc2626', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            Delete Account
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={handleDelete} disabled={deleting}
              style={{ padding: '10px 20px', borderRadius: 9, border: 'none', background: '#e8473f', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
            >
              {deleting ? 'Deleting…' : 'Yes, delete permanently'}
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              style={{ padding: '10px 20px', borderRadius: 9, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
