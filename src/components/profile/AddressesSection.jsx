import { useState } from 'react'
import { useAddresses } from '../../hooks/useAddresses'
import AddressMap from './AddressMap'

const PRESET_LABELS = ['Home', 'Work']

const emptyForm = { label: '', neighbourhood: '', street: '', apartment: '', lat: null, lng: null, is_default: false }

export default function AddressesSection({ user, showToast }) {
  const { addresses, loading, addAddress, updateAddress, deleteAddress, setDefault } = useAddresses(user)
  const [editing, setEditing] = useState(null) // null = list, {} = new, address = edit
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  function startNew() { setEditing({ ...emptyForm }) }
  function startEdit(addr) { setEditing({ ...addr }) }

  async function handleSave() {
    if (!editing.label.trim() || !editing.neighbourhood.trim()) {
      showToast('Neighbourhood and a label are required', '✕')
      return
    }
    setSaving(true)
    const payload = {
      label: editing.label.trim(),
      neighbourhood: editing.neighbourhood.trim(),
      street: editing.street?.trim() || null,
      apartment: editing.apartment?.trim() || null,
      lat: editing.lat,
      lng: editing.lng,
      is_default: editing.is_default || addresses.length === 0,
    }
    const { error } = editing.id ? await updateAddress(editing.id, payload) : await addAddress(payload)
    setSaving(false)
    if (error) { showToast(error.message || 'Failed to save address', '✕'); return }
    setEditing(null)
    showToast('Address saved', '✓')
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this address?')) return
    setDeletingId(id)
    const { error } = await deleteAddress(id)
    setDeletingId(null)
    if (error) showToast(error.message || 'Failed to delete', '✕')
    else showToast('Address removed')
  }

  if (editing !== null) {
    return (
      <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e5e7eb', padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <button onClick={() => setEditing(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#1d3a6e', fontSize: 13, fontWeight: 600, padding: 0 }}>← Back</button>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>{editing.id ? 'Edit Location' : 'Add A Location'}</h3>
        </div>

        <FormField label="Neighbourhood" required>
          <input value={editing.neighbourhood} onChange={e => setEditing(f => ({ ...f, neighbourhood: e.target.value }))} placeholder="e.g. Dubai Marina" style={inputStyle} />
        </FormField>
        <FormField label="Building or Street name">
          <input value={editing.street || ''} onChange={e => setEditing(f => ({ ...f, street: e.target.value }))} placeholder="Optional" style={inputStyle} />
        </FormField>
        <FormField label="Apartment or Villa number">
          <input value={editing.apartment || ''} onChange={e => setEditing(f => ({ ...f, apartment: e.target.value }))} placeholder="Optional" style={inputStyle} />
        </FormField>

        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 8 }}>
            Choose how you want to label your location <span style={{ color: '#e8473f' }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PRESET_LABELS.map(l => (
              <LabelBtn key={l} active={editing.label === l} onClick={() => setEditing(f => ({ ...f, label: l }))}>{l}</LabelBtn>
            ))}
            <input
              value={PRESET_LABELS.includes(editing.label) ? '' : editing.label}
              onChange={e => setEditing(f => ({ ...f, label: e.target.value }))}
              placeholder="+ Custom label"
              style={{ ...inputStyle, width: 140 }}
            />
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, cursor: 'pointer' }}>
          <input type="checkbox" checked={!!editing.is_default} onChange={e => setEditing(f => ({ ...f, is_default: e.target.checked }))} style={{ width: 16, height: 16 }} />
          <span style={{ fontSize: 13, color: '#374151' }}>Set as default</span>
        </label>

        <div style={{ marginBottom: 18 }}>
          <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 8 }}>
            Click the map or drag the pin to the exact spot.
          </p>
          <AddressMap lat={editing.lat} lng={editing.lng} onChange={(lat, lng) => setEditing(f => ({ ...f, lat, lng }))} />
        </div>

        <button
          onClick={handleSave} disabled={saving}
          style={{ width: '100%', padding: '13px', borderRadius: 99, background: '#1a1a2e', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
        >
          {saving ? 'Saving…' : 'Save Address'}
        </button>
      </div>
    )
  }

  return (
    <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e5e7eb', padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>My Addresses</h3>
        <button
          onClick={startNew}
          style={{ padding: '8px 16px', borderRadius: 99, background: '#1a1a2e', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 12.5, fontWeight: 700 }}
        >
          + Add A Location
        </button>
      </div>
      <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>Used for pickup/meetup spots when chatting with buyers or sellers</p>

      {loading ? (
        <div style={{ padding: 30, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Loading…</div>
      ) : addresses.length === 0 ? (
        <div style={{ padding: '30px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 13, border: '1.5px dashed #e5e7eb', borderRadius: 10 }}>
          No saved addresses yet
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {addresses.map(addr => (
            <div key={addr.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" fill="none" stroke="#1d3a6e" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z" /><circle cx="12" cy="9" r="2.5" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: '#1a1a2e' }}>{addr.label}</span>
                  {addr.is_default && (
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#059669', background: '#d1fae5', padding: '2px 8px', borderRadius: 99 }}>Default</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {[addr.apartment, addr.street, addr.neighbourhood].filter(Boolean).join(', ')}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {!addr.is_default && (
                  <button onClick={() => setDefault(addr.id)} style={smallBtnStyle('#374151', '#e5e7eb', '#fff')}>Set Default</button>
                )}
                <button onClick={() => startEdit(addr)} style={smallBtnStyle('#1d4ed8', '#dbeafe', '#eff6ff')}>Edit</button>
                <button onClick={() => handleDelete(addr.id)} disabled={deletingId === addr.id} style={smallBtnStyle('#dc2626', '#fca5a5', '#fff5f5')}>
                  {deletingId === addr.id ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function smallBtnStyle(color, border, bg) {
  return { fontSize: 11.5, fontWeight: 600, padding: '5px 10px', borderRadius: 6, border: `1px solid ${border}`, background: bg, color, cursor: 'pointer' }
}

function LabelBtn({ active, onClick, children }) {
  return (
    <button
      type="button" onClick={onClick}
      style={{
        padding: '9px 16px', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer',
        border: `1.5px solid ${active ? '#1a1a2e' : '#e5e7eb'}`,
        background: active ? '#1a1a2e' : '#fff', color: active ? '#fff' : '#374151',
      }}
    >
      {children}
    </button>
  )
}

function FormField({ label, required, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>
        {label} {required && <span style={{ color: '#e8473f' }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const inputStyle = {
  width: '100%', padding: '10px 12px', borderRadius: 9,
  border: '1.5px solid #e5e7eb', fontSize: 13.5, outline: 'none',
  boxSizing: 'border-box', fontFamily: 'inherit', color: '#1a1a2e',
}
