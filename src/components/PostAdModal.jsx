import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { categories } from '../data/categories.jsx'
import { supabase } from '../lib/supabase'
import { states } from '../data/locations'

function getSellerName(user) {
  return user?.user_metadata?.full_name
    || user?.user_metadata?.name
    || user?.email?.split('@')[0]
    || user?.phone
    || 'Anonymous'
}

function getInitials(user) {
  const name = getSellerName(user)
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'AN'
}

const GRADIENTS = ['li1', 'li2', 'li3', 'li4', 'li5', 'li6']

/* Category-specific extra fields */
const EXTRA_FIELDS = {
  vehicles: [
    { key: 'make', label: 'Make / Brand', type: 'text', placeholder: 'e.g. Maruti, Hyundai' },
    { key: 'year', label: 'Year', type: 'number', placeholder: 'e.g. 2020' },
    { key: 'km_driven', label: 'KM Driven', type: 'number', placeholder: 'e.g. 45000' },
    { key: 'fuel', label: 'Fuel Type', type: 'select', options: ['Petrol','Diesel','CNG','Electric','Hybrid'] },
    { key: 'transmission', label: 'Transmission', type: 'select', options: ['Manual','Automatic'] },
    { key: 'owners', label: 'No. of Owners', type: 'select', options: ['1st Owner','2nd Owner','3rd Owner','4th Owner+'] },
  ],
  bikes: [
    { key: 'make', label: 'Make / Brand', type: 'text', placeholder: 'e.g. Honda, Royal Enfield' },
    { key: 'year', label: 'Year', type: 'number', placeholder: 'e.g. 2021' },
    { key: 'km_driven', label: 'KM Driven', type: 'number', placeholder: 'e.g. 12000' },
    { key: 'fuel', label: 'Fuel Type', type: 'select', options: ['Petrol','Electric'] },
    { key: 'owners', label: 'No. of Owners', type: 'select', options: ['1st Owner','2nd Owner','3rd Owner+'] },
  ],
  mobiles: [
    { key: 'brand', label: 'Brand', type: 'select', options: ['Apple','Samsung','OnePlus','Xiaomi','Vivo','Oppo','Realme','Nothing','Google','Motorola','Other'] },
    { key: 'storage', label: 'Storage', type: 'select', options: ['32GB','64GB','128GB','256GB','512GB','1TB'] },
    { key: 'ram', label: 'RAM', type: 'select', options: ['3GB','4GB','6GB','8GB','12GB','16GB'] },
    { key: 'condition', label: 'Condition', type: 'select', options: ['New','Like New','Good','Fair'] },
  ],
  electronics: [
    { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Samsung, Sony' },
    { key: 'condition', label: 'Condition', type: 'select', options: ['Brand New','Like New','Good','Needs Repair'] },
  ],
  property: [
    { key: 'purpose', label: 'Purpose', type: 'select', options: ['For Rent','For Sale','PG / Hostel','Commercial Rent','Commercial Sale'] },
    { key: 'property_type', label: 'Type', type: 'select', options: ['Flat / Apartment','Independent House','Villa','Plot / Land','Office Space','Shop'] },
    { key: 'bhk', label: 'BHK', type: 'select', options: ['1 RK','1 BHK','2 BHK','3 BHK','4 BHK','5 BHK+'] },
    { key: 'furnishing', label: 'Furnishing', type: 'select', options: ['Fully Furnished','Semi-Furnished','Unfurnished'] },
    { key: 'area_sqft', label: 'Area (sq.ft)', type: 'number', placeholder: 'e.g. 1200' },
  ],
  furniture: [
    { key: 'condition', label: 'Condition', type: 'select', options: ['Brand New','Like New','Good','Needs Repair'] },
    { key: 'material', label: 'Material', type: 'select', options: ['Solid Wood','Engineered Wood','Metal','Fabric','Glass','Plastic'] },
  ],
  fashion: [
    { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Nike, Zara' },
    { key: 'size', label: 'Size', type: 'text', placeholder: 'e.g. M, L, 42' },
    { key: 'condition', label: 'Condition', type: 'select', options: ['Brand New','Like New','Good'] },
  ],
  books: [
    { key: 'condition', label: 'Condition', type: 'select', options: ['Brand New','Like New','Good','Acceptable'] },
    { key: 'language', label: 'Language', type: 'select', options: ['English','Hindi','Telugu','Tamil','Kannada','Other'] },
  ],
  gaming: [
    { key: 'platform', label: 'Platform', type: 'select', options: ['PlayStation 5','PlayStation 4','Xbox Series X/S','Xbox One','Nintendo Switch','PC Gaming','Mobile'] },
    { key: 'condition', label: 'Condition', type: 'select', options: ['Brand New','Like New','Good'] },
  ],
  sports: [
    { key: 'condition', label: 'Condition', type: 'select', options: ['Brand New','Like New','Good'] },
  ],
  kids: [
    { key: 'age_group', label: 'Age Group', type: 'select', options: ['0–1 Year','1–3 Years','3–5 Years','5–8 Years','8–12 Years','12+ Years'] },
    { key: 'condition', label: 'Condition', type: 'select', options: ['Brand New','Like New','Good'] },
  ],
}

/* ── Searchable city autocomplete ── */
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
        s.cities
          .filter(c => c.toLowerCase().includes(query.toLowerCase()))
          .map(c => ({ city: c, state: s.state }))
      ).slice(0, 20)
    : []

  function select(city) {
    setQuery(city)
    onChange(city)
    setOpen(false)
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); onChange(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
        placeholder="Type your city…"
        required
        autoComplete="off"
      />
      {open && results.length > 0 && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999,
          background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 10,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)', maxHeight: 220, overflowY: 'auto',
          marginTop: 4,
        }}>
          {results.map(({ city, state }) => (
            <div
              key={`${state}-${city}`}
              onMouseDown={() => select(city)}
              style={{
                padding: '10px 14px', cursor: 'pointer', fontSize: 13,
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                borderBottom: '1px solid #f3f4f6',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={e => e.currentTarget.style.background = '#fff'}
            >
              <span style={{ fontWeight: 500, color: '#1a1a2e' }}>{city}</span>
              <span style={{ fontSize: 11, color: '#9ca3af' }}>{state}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const emptyForm = { title: '', category: '', price: '', original_price: '', location: '', description: '' }

export default function PostAdModal() {
  const { postOpen, setPostOpen, showToast, user, setLoginOpen, setPendingAction, bumpListings } = useApp()
  const [form, setForm] = useState(emptyForm)
  const [extras, setExtras] = useState({})
  const [images, setImages] = useState([])
  const [previews, setPreviews] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileRef = useRef(null)

  // Redirect anonymous users to login; re-open Post Ad after login
  useEffect(() => {
    if (postOpen && !user) {
      setPostOpen(false)
      setPendingAction(() => () => setPostOpen(true))
      setLoginOpen(true)
    }
  }, [postOpen, user])

  function set(key) {
    return e => setForm(f => ({ ...f, [key]: e.target.value }))
  }

  function setExtra(key) {
    return e => setExtras(x => ({ ...x, [key]: e.target.value }))
  }

  function handleCategoryChange(e) {
    setForm(f => ({ ...f, category: e.target.value }))
    setExtras({})
  }

  function handleFiles(e) {
    const newFiles = Array.from(e.target.files)
    e.target.value = ''
    setImages(prev => [...prev, ...newFiles].slice(0, 10))
    setPreviews(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))].slice(0, 10))
  }

  function removeImage(i) {
    setImages(prev => prev.filter((_, idx) => idx !== i))
    setPreviews(prev => {
      URL.revokeObjectURL(prev[i])
      return prev.filter((_, idx) => idx !== i)
    })
  }

  async function uploadImages(listingId) {
    const urls = []
    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const ext = file.name.split('.').pop().toLowerCase()
      const path = `listings/${listingId}/${Date.now()}_${i}.${ext}`
      const { error } = await supabase.storage.from('listing-images').upload(path, file, { upsert: true })
      if (error) {
        console.error(`Upload failed for image ${i}:`, error.message)
      } else {
        const { data } = supabase.storage.from('listing-images').getPublicUrl(path)
        urls.push(data.publicUrl)
      }
      setUploadProgress(Math.round(((i + 1) / images.length) * 100))
    }
    return urls
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) {
      setPostOpen(false)
      setPendingAction(() => () => setPostOpen(true))
      setLoginOpen(true)
      return
    }
    setSubmitting(true)
    setUploadProgress(0)

    const tags = Object.values(extras).filter(Boolean)

    const { data: inserted, error: insertErr } = await supabase.from('listings').insert({
      title: form.title,
      category: form.category,
      price: Number(form.price),
      original_price: form.original_price ? Number(form.original_price) : null,
      location: form.location,
      description: form.description,
      emoji: null,
      gradient: GRADIENTS[Math.floor(Math.random() * GRADIENTS.length)],
      badge: null, badge_class: null,
      tags,
      verified: false,
      seller_name: getSellerName(user),
      seller_initials: getInitials(user),
      seller_color: '#4a4e69',
      images: [],
      user_id: user?.id,
    }).select().single()

    if (insertErr) {
      console.error('Post ad error:', insertErr)
      showToast(insertErr.message || 'Failed to post ad. Try again.', '✕')
      setSubmitting(false)
      return
    }

    let imageUrls = []
    if (images.length > 0) {
      imageUrls = await uploadImages(inserted.id)
      if (imageUrls.length > 0) {
        await supabase.from('listings').update({ images: imageUrls }).eq('id', inserted.id)
      }
    }

    setSubmitting(false)
    setPostOpen(false)
    setForm(emptyForm)
    setExtras({})
    setImages([])
    setPreviews([])
    bumpListings()
    showToast('Ad posted successfully!', '✓')
  }

  function close() {
    setPostOpen(false)
    setForm(emptyForm)
    setExtras({})
    setImages([])
    setPreviews([])
  }

  const extraFields = form.category ? (EXTRA_FIELDS[form.category] ?? []) : []

  return (
    <div className={`overlay${postOpen ? ' open' : ''}`} onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal modal-wide" style={{ maxWidth: 620, padding: '32px 32px 28px' }}>
        <button className="modal-x" onClick={close}>✕</button>

        <div className="modal-logo">Post a Free Ad</div>
        <p className="modal-sub">Reach millions of buyers across India — it's completely free!</p>

        {/* Photo upload */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 8 }}>
            Photos <span style={{ color: '#9ca3af', fontWeight: 400 }}>(up to 10 · JPG/PNG · max 5MB each)</span>
          </label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {previews.map((src, i) => (
              <div key={i} style={{ position: 'relative', width: 72, height: 72 }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10, border: '1.5px solid #e5e7eb' }} />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  style={{
                    position: 'absolute', top: -6, right: -6,
                    width: 20, height: 20, borderRadius: '50%',
                    background: '#dc2626', color: '#fff',
                    fontSize: 10, fontWeight: 700, border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >✕</button>
              </div>
            ))}
            {previews.length < 10 && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                style={{
                  width: 72, height: 72, borderRadius: 10,
                  border: '2px dashed #d1d5db', background: '#f9fafb',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 4, cursor: 'pointer', color: '#9ca3af', fontSize: 10, fontWeight: 600,
                }}
              >
                <span style={{ fontSize: 22 }}>📷</span>
                Add
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleFiles}
          />
        </div>

        <form onSubmit={handleSubmit}>
          {/* Core fields */}
          <div className="fr-row">
            <div className="fr">
              <label>Ad Title</label>
              <input value={form.title} onChange={set('title')} placeholder="e.g. iPhone 14 Pro 256GB" required />
            </div>
            <div className="fr">
              <label>Category</label>
              <select value={form.category} onChange={handleCategoryChange} required>
                <option value="">Select category</option>
                {categories.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="fr-row">
            <div className="fr">
              <label>Price (₹)</label>
              <input type="number" value={form.price} onChange={set('price')} placeholder="0" min="0" required />
            </div>
            <div className="fr">
              <label>Original Price (₹) <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: 11 }}>optional</span></label>
              <input type="number" value={form.original_price} onChange={set('original_price')} placeholder="MRP / old price" min="0" />
            </div>
          </div>

          <div className="fr">
            <label>Location</label>
            <LocationInput value={form.location} onChange={val => setForm(f => ({ ...f, location: val }))} />
          </div>

          {/* Category-specific extra fields */}
          {extraFields.length > 0 && (
            <div style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                {form.category} details
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {extraFields.map(f => (
                  <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{f.label}</label>
                    {f.type === 'select' ? (
                      <select
                        value={extras[f.key] ?? ''}
                        onChange={setExtra(f.key)}
                        style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', background: '#fff' }}
                      >
                        <option value="">Select…</option>
                        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input
                        type={f.type}
                        value={extras[f.key] ?? ''}
                        onChange={setExtra(f.key)}
                        placeholder={f.placeholder}
                        style={{ padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="fr" style={{ marginTop: 12 }}>
            <label>Description</label>
            <textarea value={form.description} onChange={set('description')} placeholder="Describe your item in detail — condition, features, reason for selling…" required />
          </div>

          {/* Upload progress */}
          {submitting && images.length > 0 && uploadProgress > 0 && uploadProgress < 100 && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Uploading photos… {uploadProgress}%</div>
              <div style={{ height: 4, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${uploadProgress}%`, background: '#1d3a6e', borderRadius: 99, transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}

          <button type="submit" className="fr-submit" disabled={submitting}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
            {submitting ? 'Posting…' : 'Post Ad for Free'}
          </button>
        </form>
      </div>
    </div>
  )
}
