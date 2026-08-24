import { useState, useRef, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { categories } from '../data/categories.jsx'
import { supabase } from '../lib/supabase'
import { states } from '../data/locations'
import UploadIcon from './icons/UploadIcon'
import PostIcon from './icons/PostIcon'

// iPhones default to HEIC/HEIF, which no browser except Safari can render —
// convert to JPEG on selection so previews and stored photos both display everywhere.
function isHeic(file) {
  return file.type === 'image/heic' || file.type === 'image/heif' || /\.hei[cf]$/i.test(file.name)
}
async function toDisplayableFile(file) {
  if (!isHeic(file)) return file
  const heic2any = (await import('heic2any')).default
  const converted = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.85 })
  const jpegBlob = Array.isArray(converted) ? converted[0] : converted
  return new File([jpegBlob], file.name.replace(/\.hei[cf]$/i, '.jpg'), { type: 'image/jpeg' })
}

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

const YEARS = Array.from({ length: 25 }, (_, i) => String(2024 - i))

/* ── Category-specific fields ────────────────────────── */
const EXTRA_FIELDS = {
  vehicles: {
    label: 'Car Details',
    fields: [
      { key: 'brand', label: 'Brand', type: 'select', options: ['Maruti Suzuki','Hyundai','Tata','Honda','Toyota','Kia','MG','Mahindra','Ford','Volkswagen','Skoda','Renault','Nissan','BMW','Mercedes-Benz','Audi','Jeep','Land Rover','Volvo','Other'] },
      { key: 'model', label: 'Model', type: 'text', placeholder: 'e.g. Swift, Creta, Nexon', span: 1 },
      { key: 'year', label: 'Year', type: 'select', options: [...YEARS, 'Before 2000'] },
      { key: 'fuel', label: 'Fuel Type', type: 'select', options: ['Petrol','Diesel','CNG','Electric','Hybrid','LPG'] },
      { key: 'transmission', label: 'Transmission', type: 'select', options: ['Manual','Automatic','AMT','CVT','DCT'] },
      { key: 'km_driven', label: 'KM Driven', type: 'number', placeholder: 'e.g. 45000' },
      { key: 'owners', label: 'No. of Owners', type: 'select', options: ['1st Owner','2nd Owner','3rd Owner','4th Owner+','Unregistered'] },
      { key: 'color', label: 'Color', type: 'text', placeholder: 'e.g. White, Silver' },
      { key: 'insurance', label: 'Insurance', type: 'select', options: ['Comprehensive','Third Party','Expired / None'] },
      { key: 'engine_cc', label: 'Engine (cc)', type: 'number', placeholder: 'e.g. 1197' },
    ],
  },
  bikes: {
    label: 'Bike Details',
    fields: [
      { key: 'brand', label: 'Brand', type: 'select', options: ['Hero','Honda','Bajaj','TVS','Royal Enfield','Yamaha','KTM','Suzuki','Kawasaki','Harley-Davidson','BMW','Triumph','Jawa','Yezdi','Ola Electric','Ather','Other'] },
      { key: 'model', label: 'Model', type: 'text', placeholder: 'e.g. Splendor, Bullet, Duke' },
      { key: 'year', label: 'Year', type: 'select', options: [...YEARS, 'Before 2000'] },
      { key: 'fuel', label: 'Fuel Type', type: 'select', options: ['Petrol','Electric'] },
      { key: 'km_driven', label: 'KM Driven', type: 'number', placeholder: 'e.g. 12000' },
      { key: 'owners', label: 'No. of Owners', type: 'select', options: ['1st Owner','2nd Owner','3rd Owner+'] },
      { key: 'engine_cc', label: 'Engine (cc)', type: 'number', placeholder: 'e.g. 350' },
      { key: 'color', label: 'Color', type: 'text', placeholder: 'e.g. Black, Red' },
    ],
  },
  mobiles: {
    label: 'Mobile Details',
    fields: [
      { key: 'brand', label: 'Brand', type: 'select', options: ['Apple','Samsung','OnePlus','Xiaomi','Vivo','Oppo','Realme','Nothing','Google','Motorola','iQOO','Poco','Infinix','Tecno','Other'] },
      { key: 'model', label: 'Model', type: 'text', placeholder: 'e.g. iPhone 14 Pro, Galaxy S23' },
      { key: 'storage', label: 'Storage', type: 'select', options: ['16GB','32GB','64GB','128GB','256GB','512GB','1TB'] },
      { key: 'ram', label: 'RAM', type: 'select', options: ['2GB','3GB','4GB','6GB','8GB','12GB','16GB'] },
      { key: 'condition', label: 'Condition', type: 'select', options: ['Brand New','Like New','Good','Fair'] },
      { key: 'warranty', label: 'Warranty', type: 'select', options: ['Under Warranty','Out of Warranty','No Warranty'] },
      { key: 'accessories', label: 'With Accessories', type: 'select', options: ['Box + Charger + All','Charger Only','Box Only','Phone Only'] },
      { key: 'color', label: 'Color', type: 'text', placeholder: 'e.g. Space Black, Purple' },
    ],
  },
  electronics: {
    label: 'Electronics Details',
    fields: [
      { key: 'item_type', label: 'Item Type', type: 'select', options: ['TV / Monitor','Laptop','Desktop','Tablet','Camera / DSLR','Headphones / Earbuds','Speaker','Washing Machine','AC','Refrigerator','Microwave / Oven','Printer','UPS / Inverter','Other'] },
      { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Samsung, Sony, LG' },
      { key: 'model', label: 'Model / Variant', type: 'text', placeholder: 'e.g. 55" OLED 4K, ThinkPad E15' },
      { key: 'condition', label: 'Condition', type: 'select', options: ['Brand New','Like New','Good','Needs Repair'] },
      { key: 'warranty', label: 'Warranty', type: 'select', options: ['Under Warranty','Out of Warranty','No Warranty'] },
      { key: 'age', label: 'Age of Item', type: 'select', options: ['Less than 1 Year','1–2 Years','2–3 Years','3–5 Years','5+ Years'] },
    ],
  },
  property: {
    label: 'Property Details',
    fields: [
      { key: 'purpose', label: 'Purpose', type: 'select', options: ['For Sale','For Rent','PG / Hostel','Lease','Commercial Sale','Commercial Rent'] },
      { key: 'property_type', label: 'Property Type', type: 'select', options: ['Flat / Apartment','Independent House / Villa','Builder Floor','Studio Apartment','Plot / Land','Office Space','Shop / Showroom','Warehouse','Other'] },
      { key: 'bhk', label: 'BHK / Rooms', type: 'select', options: ['1 RK','1 BHK','2 BHK','3 BHK','4 BHK','5 BHK','6 BHK+','Open Plot'] },
      { key: 'area_sqft', label: 'Area (sq.ft)', type: 'number', placeholder: 'e.g. 1200' },
      { key: 'furnishing', label: 'Furnishing', type: 'select', options: ['Fully Furnished','Semi-Furnished','Unfurnished'] },
      { key: 'bathrooms', label: 'Bathrooms', type: 'select', options: ['1','2','3','4','5+'] },
      { key: 'floor', label: 'Floor No.', type: 'text', placeholder: 'e.g. 3rd of 10' },
      { key: 'parking', label: 'Parking', type: 'select', options: ['Covered Parking','Open Parking','No Parking'] },
      { key: 'facing', label: 'Facing', type: 'select', options: ['North','South','East','West','North-East','North-West','South-East','South-West'] },
      { key: 'age_property', label: 'Property Age', type: 'select', options: ['Under Construction','New / Ready to Move','Less than 1 Year','1–5 Years','5–10 Years','10–20 Years','20+ Years'] },
    ],
  },
  furniture: {
    label: 'Furniture Details',
    fields: [
      { key: 'item_type', label: 'Furniture Type', type: 'select', options: ['Sofa / Couch','Bed Frame','Wardrobe','Dining Table + Chairs','Study / Office Table','Chair','Bookshelf / Rack','TV Unit / Entertainment','Mattress','Dressing Table','Modular Kitchen','Kids Furniture','Other'] },
      { key: 'condition', label: 'Condition', type: 'select', options: ['Brand New','Like New','Good','Needs Repair'] },
      { key: 'material', label: 'Material', type: 'select', options: ['Solid Wood','Engineered Wood / MDF','Plywood','Metal / Steel','Fabric / Upholstered','Rattan / Cane','Glass','Plastic'] },
      { key: 'color', label: 'Color / Finish', type: 'text', placeholder: 'e.g. Walnut Brown, White' },
      { key: 'age', label: 'Age', type: 'select', options: ['Less than 1 Year','1–2 Years','2–5 Years','5+ Years'] },
    ],
  },
  fashion: {
    label: 'Fashion Details',
    fields: [
      { key: 'item_type', label: 'Item Type', type: 'select', options: ["Men's Clothing","Women's Clothing","Kids' Clothing","Men's Footwear","Women's Footwear","Bags / Purses","Accessories","Watches","Jewellery","Ethnic Wear","Winter Wear","Sportswear","Other"] },
      { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Nike, Zara, Fabindia' },
      { key: 'size', label: 'Size', type: 'text', placeholder: 'e.g. M, L, XL, 42, 8UK' },
      { key: 'color', label: 'Color', type: 'text', placeholder: 'e.g. Navy Blue, Red' },
      { key: 'condition', label: 'Condition', type: 'select', options: ['Brand New with Tags','Brand New without Tags','Like New','Good','Fair'] },
    ],
  },
  books: {
    label: 'Book Details',
    fields: [
      { key: 'item_type', label: 'Book Type', type: 'select', options: ['Textbook / Academic','Novel / Fiction','Non-Fiction','Self-Help / Motivation','Comics / Manga','Magazine','Children Book','Religious / Spiritual','Other'] },
      { key: 'author', label: 'Author / Publisher', type: 'text', placeholder: 'e.g. J.K. Rowling, NCERT' },
      { key: 'edition', label: 'Edition / Year', type: 'text', placeholder: 'e.g. 3rd Edition, 2023' },
      { key: 'condition', label: 'Condition', type: 'select', options: ['Brand New','Like New','Good','Acceptable'] },
      { key: 'language', label: 'Language', type: 'select', options: ['English','Hindi','Telugu','Tamil','Kannada','Malayalam','Bengali','Marathi','Gujarati','Punjabi','Other'] },
    ],
  },
  sports: {
    label: 'Sports Details',
    fields: [
      { key: 'sport_type', label: 'Sport / Activity', type: 'select', options: ['Cricket','Football','Badminton','Tennis','Table Tennis','Basketball','Volleyball','Cycling','Swimming','Gym Equipment','Yoga / Fitness','Skating / Skating','Martial Arts','Camping / Trekking','Other'] },
      { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Yonex, Decathlon, Cosco' },
      { key: 'condition', label: 'Condition', type: 'select', options: ['Brand New','Like New','Good','Fair'] },
      { key: 'age', label: 'Age of Item', type: 'select', options: ['Less than 1 Year','1–2 Years','2–3 Years','3–5 Years','5+ Years'] },
    ],
  },
  pets: {
    label: 'Pet Details',
    fields: [
      { key: 'pet_type', label: 'Pet Type', type: 'select', options: ['Dog','Cat','Fish','Bird (Parrot)','Bird (Other)','Rabbit','Hamster / Guinea Pig','Turtle / Tortoise','Other'] },
      { key: 'breed', label: 'Breed', type: 'text', placeholder: 'e.g. Golden Retriever, Persian' },
      { key: 'age', label: 'Age', type: 'select', options: ['0–3 Months','3–6 Months','6–12 Months','1–2 Years','2–5 Years','5+ Years'] },
      { key: 'gender', label: 'Gender', type: 'select', options: ['Male','Female'] },
      { key: 'vaccinated', label: 'Vaccinated', type: 'select', options: ['Fully Vaccinated','Partially Vaccinated','Not Vaccinated'] },
      { key: 'pedigree', label: 'KCI / Pedigree', type: 'select', options: ['KCI Registered','Pedigree (No KCI)','Non-Pedigree / Mixed Breed'] },
    ],
  },
  gaming: {
    label: 'Gaming Details',
    fields: [
      { key: 'platform', label: 'Platform', type: 'select', options: ['PlayStation 5','PlayStation 4','Xbox Series X/S','Xbox One','Nintendo Switch','PC / Gaming Laptop','Mobile Gaming','Retro / Old Consoles','Other'] },
      { key: 'item_type', label: 'Item Type', type: 'select', options: ['Console','Game Disc','Game (Digital Code)','Controller / Joystick','Gaming Chair','Gaming Monitor','Headset','Keyboard / Mouse','VR Headset','Other Accessory'] },
      { key: 'condition', label: 'Condition', type: 'select', options: ['Brand New','Like New','Good','Needs Repair'] },
      { key: 'storage', label: 'Storage / Model', type: 'text', placeholder: 'e.g. PS5 Digital, Xbox 1TB' },
    ],
  },
  services: {
    label: 'Service Details',
    fields: [
      { key: 'service_type', label: 'Service Type', type: 'select', options: ['Home Cleaning','Plumbing','Electrical Work','Carpentry / Furniture','Painting','AC / Appliance Repair','Pest Control','Tutoring / Teaching','Music / Dance Classes','Photography / Videography','Catering / Cooking','Event Planning','Driver / Chauffeur','Security Guard','IT / Tech Support','Graphic / Web Design','Content Writing','Courier / Delivery','Other'] },
      { key: 'experience', label: 'Experience', type: 'select', options: ['Less than 1 Year','1–3 Years','3–5 Years','5–10 Years','10+ Years'] },
      { key: 'availability', label: 'Availability', type: 'select', options: ['Full-Time','Part-Time','Weekends Only','On-Call / Flexible','Project Basis'] },
    ],
  },
  kids: {
    label: 'Kids Item Details',
    fields: [
      { key: 'item_type', label: 'Item Type', type: 'select', options: ["Educational Toy","General Toy","Baby Clothing","Kids Clothing","Baby Footwear","Kids Footwear","Pram / Stroller","Baby Car Seat","Cot / Cradle","Baby Monitor","School Bag","Cycle / Tricycle","Books / Study Material","Baby Food / Care (Unopened)","Other"] },
      { key: 'age_group', label: 'For Age Group', type: 'select', options: ['0–1 Year','1–3 Years','3–5 Years','5–8 Years','8–12 Years','12+ Years'] },
      { key: 'brand', label: 'Brand', type: 'text', placeholder: 'e.g. Fisher-Price, Chicco, Lego' },
      { key: 'condition', label: 'Condition', type: 'select', options: ['Brand New','Like New','Good','Fair'] },
    ],
  },
}

/* ── City autocomplete ───────────────────────────────── */
function LocationInput({ value, onChange }) {
  const [query, setQuery] = useState(value || '')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

  useEffect(() => {
    function onMouseDown(e) { if (!wrapRef.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const results = query.trim().length >= 2
    ? states.flatMap(s =>
        s.cities.filter(c => c.toLowerCase().includes(query.toLowerCase())).map(c => ({ city: c, state: s.state }))
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
        required
        autoComplete="off"
      />
      {open && results.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 9999, background: '#fff', border: '1.5px solid #e5e7eb', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.1)', maxHeight: 200, overflowY: 'auto', marginTop: 4 }}>
          {results.map(({ city, state }) => (
            <div
              key={`${state}-${city}`}
              onMouseDown={() => select(city)}
              style={{ padding: '9px 14px', cursor: 'pointer', fontSize: 13, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6' }}
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

/* ── Field renderer ──────────────────────────────────── */
function ExtraField({ field, value, onChange }) {
  const style = { padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', width: '100%', background: '#fff', boxSizing: 'border-box' }
  if (field.type === 'select') {
    return (
      <select value={value ?? ''} onChange={onChange} style={style}>
        <option value="">Select…</option>
        {field.options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    )
  }
  return (
    <input
      type={field.type}
      value={value ?? ''}
      onChange={onChange}
      placeholder={field.placeholder}
      style={style}
      min={field.type === 'number' ? 0 : undefined}
    />
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

  useEffect(() => {
    if (postOpen && !user) {
      setPostOpen(false)
      setPendingAction(() => () => setPostOpen(true))
      setLoginOpen(true)
    }
  }, [postOpen, user])

  function set(key) { return e => setForm(f => ({ ...f, [key]: e.target.value })) }
  function setExtra(key) { return e => setExtras(x => ({ ...x, [key]: e.target.value })) }

  function handleCategoryChange(e) {
    setForm(f => ({ ...f, category: e.target.value }))
    setExtras({})
  }

  async function handleFiles(e) {
    const rawFiles = Array.from(e.target.files)
    e.target.value = ''

    const converted = await Promise.all(rawFiles.map(async file => {
      try { return await toDisplayableFile(file) }
      catch { showToast(`Couldn't process ${file.name} — try a JPG/PNG instead`, '✕'); return null }
    }))
    const newFiles = converted.filter(Boolean)

    setImages(prev => [...prev, ...newFiles].slice(0, 10))
    setPreviews(prev => [...prev, ...newFiles.map(f => URL.createObjectURL(f))].slice(0, 10))
  }

  function removeImage(i) {
    setImages(prev => prev.filter((_, idx) => idx !== i))
    setPreviews(prev => { URL.revokeObjectURL(prev[i]); return prev.filter((_, idx) => idx !== i) })
  }

  async function uploadImages(listingId) {
    const urls = []
    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      const ext = file.name.split('.').pop().toLowerCase()
      const path = `listings/${listingId}/${Date.now()}_${i}.${ext}`
      const { error } = await supabase.storage.from('listing-images').upload(path, file)
      if (error) {
        showToast(`Photo ${i + 1} failed: ${error.message}`, '✕')
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
    if (!user) { setPostOpen(false); setPendingAction(() => () => setPostOpen(true)); setLoginOpen(true); return }
    setSubmitting(true)
    setUploadProgress(0)

    const tags = Object.entries(extras).filter(([, v]) => v).map(([k, v]) => `${k}:${v}`)

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
      extras,
      seller_name: getSellerName(user),
      seller_initials: getInitials(user),
      seller_color: '#4a4e69',
      images: [],
      user_id: user?.id,
    }).select().single()

    if (insertErr) {
      showToast(insertErr.message || 'Failed to post ad. Try again.', '✕')
      setSubmitting(false)
      return
    }

    let photosFailed = false
    if (images.length > 0) {
      const imageUrls = await uploadImages(inserted.id)
      if (imageUrls.length > 0) {
        const { error: imgErr } = await supabase.from('listings').update({ images: imageUrls }).eq('id', inserted.id)
        if (imgErr) photosFailed = true
      } else {
        photosFailed = true
      }
    }

    setSubmitting(false)
    setPostOpen(false)
    setForm(emptyForm)
    setExtras({})
    setImages([])
    setPreviews([])
    bumpListings()
    showToast(photosFailed ? 'Ad posted! Photos failed — check storage settings.' : 'Ad posted successfully!', photosFailed ? '⚠' : '✓')
  }

  function close() {
    setPostOpen(false)
    setForm(emptyForm)
    setExtras({})
    setImages([])
    setPreviews([])
  }

  const catConfig = form.category ? EXTRA_FIELDS[form.category] : null
  const extraFields = catConfig?.fields ?? []

  return (
    <div className={`overlay${postOpen ? ' open' : ''}`} style={{ zIndex: 1300 }} onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal modal-wide" style={{ maxWidth: 660, padding: '28px 32px 28px', maxHeight: '92vh', overflowY: 'auto' }}>
        <button className="modal-x" onClick={close}>✕</button>

        <div className="modal-logo">Post a Free Ad</div>
        <p className="modal-sub">Reach millions of buyers across India — completely free!</p>

        <form onSubmit={handleSubmit}>

          {/* ── Step 1: Category ─────────────────────── */}
          <SectionHead n="1" title="Choose Category" />
          <div className="fr">
            <label>Category <Req /></label>
            <select value={form.category} onChange={handleCategoryChange} required>
              <option value="">Select a category…</option>
              {categories.filter(c => c.id !== 'all').map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* ── Step 2: Photos ───────────────────────── */}
          <SectionHead n="2" title="Add Photos" sub="More photos = more buyers. Upload up to 10 (5 MB each)." />
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-start' }}>
              {previews.map((src, i) => (
                <div key={i} style={{ position: 'relative', width: 80, height: 80 }}>
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 10, border: '1.5px solid #e5e7eb' }} />
                  {i === 0 && (
                    <span style={{ position: 'absolute', bottom: 4, left: 4, background: '#1d3a6e', color: '#fff', fontSize: 8, fontWeight: 700, padding: '2px 5px', borderRadius: 4 }}>COVER</span>
                  )}
                  <button type="button" onClick={() => removeImage(i)} style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: '#dc2626', color: '#fff', fontSize: 10, fontWeight: 700, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                </div>
              ))}
              {previews.length < 10 && (
                <button type="button" onClick={() => fileRef.current?.click()} style={{ width: 80, height: 80, borderRadius: 10, border: '2px dashed #d1d5db', background: '#f9fafb', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, cursor: 'pointer', color: '#9ca3af', fontSize: 10, fontWeight: 600, flexShrink: 0 }}>
                  <UploadIcon size={22} stroke="#9ca3af" strokeWidth="1.8" />
                  {previews.length === 0 ? 'Add Photo' : 'Add More'}
                </button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFiles} />
            {previews.length > 0 && (
              <p style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 6 }}>Drag to reorder · First photo is the cover image</p>
            )}
          </div>

          {/* ── Step 3: Category-specific details ───── */}
          {catConfig && extraFields.length > 0 && (
            <>
              <SectionHead n="3" title={catConfig.label} />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 20 }}>
                {extraFields.map(f => (
                  <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{f.label}</label>
                    <ExtraField field={f} value={extras[f.key]} onChange={setExtra(f.key)} />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Step 4: Ad Info ──────────────────────── */}
          <SectionHead n={catConfig ? '4' : '3'} title="Ad Information" />

          <div className="fr">
            <label>Ad Title <Req /></label>
            <input
              value={form.title}
              onChange={set('title')}
              placeholder={adTitlePlaceholder(form.category)}
              required
            />
          </div>

          <div className="fr-row">
            <div className="fr">
              <label>Set Price (₹) <Req /></label>
              <input type="number" value={form.price} onChange={set('price')} placeholder="0" min="0" required />
            </div>
            <div className="fr">
              <label>Original / MRP (₹) <span style={{ color: '#9ca3af', fontWeight: 400, fontSize: 11 }}>optional</span></label>
              <input type="number" value={form.original_price} onChange={set('original_price')} placeholder="Old / MRP price" min="0" />
            </div>
          </div>

          {/* ── Step 5: Location ─────────────────────── */}
          <SectionHead n={catConfig ? '5' : '4'} title="Location" />
          <div className="fr-row">
            <div className="fr">
              <label>State <Req /></label>
              <select
                value={form.state || ''}
                onChange={e => setForm(f => ({ ...f, state: e.target.value, location: '' }))}
                required
              >
                <option value="">Select state…</option>
                {states.map(s => <option key={s.state} value={s.state}>{s.state}</option>)}
              </select>
            </div>
            <div className="fr">
              <label>City <Req /></label>
              <LocationInput value={form.location} onChange={val => setForm(f => ({ ...f, location: val }))} />
            </div>
          </div>

          {/* ── Step 6: Description ──────────────────── */}
          <SectionHead n={catConfig ? '6' : '5'} title="Description" />
          <div className="fr">
            <label>Detailed Description <Req /></label>
            <textarea
              value={form.description}
              onChange={set('description')}
              placeholder={descPlaceholder(form.category)}
              required
              style={{ minHeight: 110 }}
            />
          </div>

          {/* Upload progress */}
          {submitting && images.length > 0 && uploadProgress > 0 && uploadProgress < 100 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 4 }}>Uploading photos… {uploadProgress}%</div>
              <div style={{ height: 4, background: '#e5e7eb', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${uploadProgress}%`, background: '#1d3a6e', borderRadius: 99, transition: 'width 0.3s ease' }} />
              </div>
            </div>
          )}

          <button type="submit" className="fr-submit" disabled={submitting}>
            <PostIcon size={15} />
            {submitting ? 'Posting…' : 'Post Ad for Free'}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ── Helpers ─────────────────────────────────────────── */
function SectionHead({ n, title, sub }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14, marginTop: 20, borderTop: '1px solid #f3f4f6', paddingTop: 20 }}>
      <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#1d3a6e', color: '#fff', fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{n}</span>
      <div>
        <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1a2e' }}>{title}</div>
        {sub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  )
}

function Req() {
  return <span style={{ color: '#e8473f' }}> *</span>
}

function adTitlePlaceholder(cat) {
  const map = {
    vehicles: 'e.g. 2020 Maruti Swift VXi — Single Owner',
    bikes: 'e.g. Royal Enfield Bullet 350 — 2022',
    mobiles: 'e.g. iPhone 14 Pro 256GB Space Black',
    electronics: 'e.g. Samsung 55" OLED 4K TV — 2 Years Old',
    property: 'e.g. 2BHK Fully Furnished Flat in Banjara Hills',
    furniture: 'e.g. Teak Wood King Size Bed with Storage',
    fashion: 'e.g. Nike Air Max — Size 10 — Brand New',
    books: 'e.g. NCERT Physics Class 12 — Like New',
    sports: 'e.g. Yonex Badminton Racket — Good Condition',
    pets: 'e.g. Golden Retriever Puppy — 3 Months Old',
    gaming: 'e.g. PlayStation 5 Digital Edition — Like New',
    services: 'e.g. Professional Home Cleaning — Hyderabad',
    kids: 'e.g. Fisher-Price Baby Rocker — Barely Used',
  }
  return map[cat] || 'Write a clear, descriptive title…'
}

function descPlaceholder(cat) {
  const map = {
    vehicles: 'Include details like service history, accident history, accessories, reason for selling, any modifications…',
    bikes: 'Mention service history, tyre condition, accessories, reason for selling…',
    mobiles: 'Describe the phone condition, any scratches/dents, battery health, included accessories, reason for selling…',
    property: 'Describe the property features, nearby landmarks, amenities (gym, pool, park), society name, water/power supply…',
    pets: 'Describe the pet\'s temperament, diet, health history, vaccinations, reason for selling/adopting…',
    services: 'Describe your skills, past experience, tools/equipment you bring, area you cover, pricing model…',
  }
  return map[cat] || 'Describe your item in detail — condition, features, reason for selling, any defects, what\'s included…'
}
