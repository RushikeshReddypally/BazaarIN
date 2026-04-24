import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'
import { formatPriceFull } from '../utils/format'
import { states } from '../data/locations'

function LocationInput({ value, onChange }) {
  const [query, setQuery] = useState(value || '')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    function onMouseDown(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const results = query.trim().length >= 2
    ? states.flatMap(s =>
        s.cities.filter(c => c.toLowerCase().includes(query.toLowerCase()))
          .map(c => ({ city: c, state: s.state, icon: s.icon }))
      ).slice(0, 20)
    : []

  function select(city) { setQuery(city); onChange(city); setOpen(false) }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder="Type your city…"
        autoComplete="off"
        style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13.5, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
      />
      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999,
          background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', maxHeight: 200, overflowY: 'auto', marginTop: 4,
        }}>
          {results.map(({ city, state, icon }) => (
            <div key={`${state}-${city}`} onMouseDown={() => select(city)}
              style={{ padding: '9px 14px', cursor: 'pointer', fontSize: 13, display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f3f4f6' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <span style={{ fontWeight: 500 }}>{city}</span>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>{icon} {state}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ── Edit panel (slides in over the list) ── */
function EditPanel({ ad, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: ad.title ?? '',
    price: ad.price ?? '',
    original_price: ad.original_price ?? '',
    location: ad.location ?? '',
    description: ad.description ?? '',
    category: ad.category ?? '',
  })
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState(ad.images ?? [])
  const [saving, setSaving] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileRef = useRef(null)

  function set(key) {
    return e => setForm(f => ({ ...f, [key]: e.target.value }))
  }

  function handleFiles(e) {
    const files = Array.from(e.target.files).slice(0, 10 - previews.length)
    setImages(prev => [...prev, ...files])
    setPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  function removePreview(i) {
    const isNew = i >= (ad.images?.length ?? 0)
    if (isNew) {
      const newIdx = i - (ad.images?.length ?? 0)
      setImages(prev => prev.filter((_, idx) => idx !== newIdx))
    }
    setPreviews(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSave() {
    setSaving(true)
    let imageUrls = previews.filter((_, i) => i < (ad.images?.length ?? 0))

    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const ext = file.name.split('.').pop()
      const path = `listings/${ad.id}/${Date.now()}_${i}.${ext}`
      const { error } = await supabase.storage.from('listing-images').upload(path, file)
      if (!error) {
        const { data } = supabase.storage.from('listing-images').getPublicUrl(path)
        imageUrls.push(data.publicUrl)
      }
      setUploadProgress(Math.round(((i + 1) / images.length) * 100))
    }

    const { error } = await supabase.from('listings').update({
      title: form.title,
      price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : null,
      location: form.location,
      description: form.description,
      images: imageUrls,
    }).eq('id', ad.id)

    setSaving(false)
    if (!error) onSave({ ...ad, ...form, price: Number(form.price), images: imageUrls })
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: '1.5px solid #e5e7eb', fontSize: 13.5, outline: 'none',
    fontFamily: 'inherit', boxSizing: 'border-box',
  }
  const labelStyle = { fontSize: 12.5, fontWeight: 600, color: '#374151', marginBottom: 4, display: 'block' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#9ca3af', padding: 0, lineHeight: 1 }}>←</button>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>Edit Ad</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Photos */}
        <div>
          <label style={labelStyle}>Photos</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {previews.map((src, i) => (
              <div key={i} style={{ position: 'relative', width: 66, height: 66 }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 9, border: '1.5px solid #e5e7eb' }} />
                <button type="button" onClick={() => removePreview(i)} style={{
                  position: 'absolute', top: -6, right: -6, width: 18, height: 18,
                  borderRadius: '50%', background: '#dc2626', color: '#fff',
                  fontSize: 9, fontWeight: 700, border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>✕</button>
              </div>
            ))}
            {previews.length < 10 && (
              <button type="button" onClick={() => fileRef.current?.click()} style={{
                width: 66, height: 66, borderRadius: 9, border: '2px dashed #d1d5db',
                background: '#f9fafb', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 2,
                cursor: 'pointer', color: '#9ca3af', fontSize: 10, fontWeight: 600,
              }}>
                <span style={{ fontSize: 20 }}>📷</span>Add
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFiles} />
          </div>
        </div>

        {/* Title */}
        <div>
          <label style={labelStyle}>Title</label>
          <input value={form.title} onChange={set('title')} style={inputStyle} />
        </div>

        {/* Price row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <div>
            <label style={labelStyle}>Price (₹)</label>
            <input type="number" value={form.price} onChange={set('price')} style={inputStyle} min="0" />
          </div>
          <div>
            <label style={labelStyle}>Original Price (₹) <span style={{ color: '#9ca3af', fontWeight: 400 }}>optional</span></label>
            <input type="number" value={form.original_price} onChange={set('original_price')} style={inputStyle} min="0" placeholder="MRP" />
          </div>
        </div>

        {/* Location */}
        <div>
          <label style={labelStyle}>Location</label>
          <LocationInput value={form.location} onChange={val => setForm(f => ({ ...f, location: val }))} />
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}>Description</label>
          <textarea value={form.description} onChange={set('description')} rows={4}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
        </div>

        {/* Upload progress */}
        {saving && images.length > 0 && uploadProgress > 0 && uploadProgress < 100 && (
          <div>
            <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Uploading photos… {uploadProgress}%</div>
            <div style={{ height: 4, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${uploadProgress}%`, background: '#1d3a6e', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', gap: 10, paddingTop: 16, borderTop: '1px solid #f3f4f6', marginTop: 16 }}>
        <button onClick={onCancel} style={{
          flex: 1, padding: '11px', borderRadius: 10, fontSize: 13.5, fontWeight: 600,
          border: '1.5px solid #e5e7eb', background: '#fff', cursor: 'pointer', color: '#6b7280',
        }}>Cancel</button>
        <button onClick={handleSave} disabled={saving} style={{
          flex: 2, padding: '11px', borderRadius: 10, fontSize: 13.5, fontWeight: 700,
          border: 'none', background: '#1d3a6e', color: '#fff', cursor: 'pointer',
          opacity: saving ? 0.7 : 1,
        }}>{saving ? 'Saving…' : 'Save Changes'}</button>
      </div>
    </div>
  )
}

/* ── Ad list item ── */
function AdRow({ ad, onView, onEdit, onToggleSold, onDelete, deleting }) {
  const isSold = ad.badge === 'Sold'
  return (
    <div style={{
      display: 'flex', gap: 14, alignItems: 'center',
      padding: '14px 16px', borderRadius: 14,
      border: `1.5px solid ${isSold ? '#e5e7eb' : '#f3f4f6'}`,
      background: isSold ? '#fafafa' : '#fff',
      opacity: isSold ? 0.75 : 1,
      transition: 'opacity 0.15s',
    }}>
      {/* Thumbnail */}
      <div className={ad.gradient || 'li1'} style={{
        width: 64, height: 64, borderRadius: 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, overflow: 'hidden', cursor: 'pointer',
      }} onClick={onView}>
        {ad.images?.[0]
          ? <img src={ad.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : ad.emoji}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={onView}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {ad.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 3 }}>
          <span style={{ fontSize: 15, fontWeight: 900, color: '#1d3a6e' }}>{formatPriceFull(ad.price)}</span>
          {isSold && <span style={{ fontSize: 10, fontWeight: 700, background: '#6b7280', color: '#fff', padding: '2px 7px', borderRadius: 99 }}>SOLD</span>}
        </div>
        <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
          📍 {ad.location} · {new Date(ad.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flexShrink: 0 }}>
        <button onClick={onEdit} style={{
          padding: '5px 11px', borderRadius: 7, fontSize: 11.5, fontWeight: 600,
          border: '1.5px solid #dbeafe', background: '#eff6ff', cursor: 'pointer', color: '#1d4ed8',
        }}>✏️ Edit</button>
        <button onClick={onToggleSold} style={{
          padding: '5px 11px', borderRadius: 7, fontSize: 11.5, fontWeight: 600,
          border: `1.5px solid ${isSold ? '#d1fae5' : '#e5e7eb'}`,
          background: isSold ? '#ecfdf5' : '#fff',
          cursor: 'pointer', color: isSold ? '#059669' : '#6b7280',
        }}>{isSold ? '✓ Active' : 'Mark Sold'}</button>
        <button onClick={onDelete} disabled={deleting} style={{
          padding: '5px 11px', borderRadius: 7, fontSize: 11.5, fontWeight: 600,
          border: '1.5px solid #fca5a5', background: '#fff5f5',
          cursor: 'pointer', color: '#dc2626',
        }}>{deleting ? '…' : '🗑️ Delete'}</button>
      </div>
    </div>
  )
}

/* ── Main modal ── */
export default function MyAdsModal() {
  const { myAdsOpen, setMyAdsOpen, user, setActiveListing, showToast } = useApp()
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [editing, setEditing] = useState(null) // ad being edited

  useEffect(() => {
    if (!myAdsOpen || !user) return
    setEditing(null)
    setLoading(true)
    supabase
      .from('listings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setAds(data ?? [])
        setLoading(false)
      })
  }, [myAdsOpen, user])

  async function deleteAd(id) {
    if (!confirm('Delete this ad? This cannot be undone.')) return
    setDeleting(id)
    const { error } = await supabase.from('listings').delete().eq('id', id)
    if (error) showToast('Failed to delete. Try again.', '✕')
    else { setAds(prev => prev.filter(a => a.id !== id)); showToast('Ad deleted.', '🗑️') }
    setDeleting(null)
  }

  async function toggleSold(ad) {
    const newBadge = ad.badge === 'Sold' ? null : 'Sold'
    const newClass = newBadge ? 'badge-sold' : null
    const { error } = await supabase.from('listings').update({ badge: newBadge, badge_class: newClass }).eq('id', ad.id)
    if (!error) {
      setAds(prev => prev.map(a => a.id === ad.id ? { ...a, badge: newBadge, badge_class: newClass } : a))
      showToast(newBadge ? 'Marked as Sold' : 'Marked as Active', '✓')
    }
  }

  function handleSaved(updated) {
    setAds(prev => prev.map(a => a.id === updated.id ? updated : a))
    setEditing(null)
    showToast('Ad updated!', '✓')
  }

  function close() { setMyAdsOpen(false); setEditing(null) }

  return (
    <div className={`overlay${myAdsOpen ? ' open' : ''}`} onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal modal-wide" style={{ maxWidth: 620, padding: '32px 28px 28px', minHeight: 420, display: 'flex', flexDirection: 'column' }}>
        <button className="modal-x" onClick={close}>✕</button>

        {/* Edit mode */}
        {editing ? (
          <EditPanel
            ad={editing}
            onSave={handleSaved}
            onCancel={() => setEditing(null)}
          />
        ) : (
          <>
            <div className="modal-logo">My Ads</div>
            <p className="modal-sub">
              {ads.length > 0 ? `${ads.length} listing${ads.length > 1 ? 's' : ''}` : 'Manage your active listings'}
            </p>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>Loading your ads…</div>
            ) : ads.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>📭</div>
                <div style={{ color: '#6b7280', fontSize: 14 }}>You haven't posted any ads yet.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 480, overflowY: 'auto' }}>
                {ads.map(ad => (
                  <AdRow
                    key={ad.id}
                    ad={ad}
                    onView={() => { close(); setActiveListing(ad) }}
                    onEdit={() => setEditing(ad)}
                    onToggleSold={() => toggleSold(ad)}
                    onDelete={() => deleteAd(ad.id)}
                    deleting={deleting === ad.id}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
