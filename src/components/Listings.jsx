import { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'
import ListingCard from './ListingCard'
import VerifiedBanner from './VerifiedBanner'
import { categoryIcons } from '../data/categories.jsx'
import ChevronIcon from './icons/ChevronIcon'
import CheckIcon from './icons/CheckIcon'
import SearchIcon from './icons/SearchIcon'
import FilterIcon from './icons/FilterIcon'
import ListViewIcon from './icons/ListViewIcon'
import PostIcon from './icons/PostIcon'

/* ── Inline filter pill dropdown ── */
function FilterBtn({ label, options, value, onChange }) {
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const btnRef = useRef(null)
  const dropRef = useRef(null)
  const active = !!value

  useEffect(() => {
    function onMouseDown(e) {
      if (!btnRef.current?.contains(e.target) && !dropRef.current?.contains(e.target))
        setOpen(false)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  // Recompute position on every scroll/resize while open, not just once at
  // open-time, so it can't drift out of sync with the button underneath it.
  useEffect(() => {
    if (!open) return
    function place() {
      if (!btnRef.current) return
      const r = btnRef.current.getBoundingClientRect()
      const width = Math.max(r.width, 180)
      const maxLeft = window.innerWidth - width - 12
      const left = Math.max(12, Math.min(r.left, maxLeft))
      setPos({ top: r.bottom + 6, left, width })
    }
    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [open])

  function toggle() {
    setOpen(o => !o)
  }

  return (
    <>
      <button
        ref={btnRef}
        onClick={toggle}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
          padding: '8px 13px', borderRadius: 99, whiteSpace: 'nowrap',
          fontSize: 13, fontWeight: 500, cursor: 'pointer',
          border: `1.5px solid ${active ? '#1d3a6e' : '#d1d5db'}`,
          background: active ? '#1d3a6e' : '#fff',
          color: active ? '#fff' : '#374151',
          transition: 'all 0.15s ease',
        }}
      >
        {active ? `${label}: ${value}` : label}
        <ChevronIcon open={open} size={10} style={{ opacity: 0.7 }} />
      </button>

      {open && createPortal(
        <div ref={dropRef} style={{
          position: 'fixed', top: pos.top, left: pos.left,
          background: '#fff', borderRadius: 12, border: '1.5px solid #e5e7eb',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)', zIndex: 9999,
          minWidth: pos.width, maxWidth: 'calc(100vw - 24px)', overflow: 'hidden',
        }}>
          <div style={{ padding: '6px 0', maxHeight: 280, overflowY: 'auto' }}>
            {options.map((opt, i) => {
              const selected = value === opt
              return (
                <div key={opt}>
                  <div
                    onClick={() => { onChange(selected ? null : opt); setOpen(false) }}
                    style={{
                      padding: '10px 16px', cursor: 'pointer', fontSize: 13,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      background: selected ? '#eff6ff' : 'transparent',
                      color: selected ? '#1d3a6e' : '#1a1a2e',
                      fontWeight: selected ? 600 : 400,
                    }}
                  >
                    {opt}
                    {selected && <CheckIcon size={13} color="#1d3a6e" />}
                  </div>
                  {i < options.length - 1 && <div style={{ height: 1, background: '#f3f4f6', margin: '0 10px' }} />}
                </div>
              )
            })}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

/* ── More Filters panel ── */
function MoreFiltersPanel({ groups, activeSubFilters, onChange, activeCount, onClose, anchorRef }) {
  const [pos, setPos] = useState({ top: 0, left: 0, width: 340, maxHeight: 480 })
  const panelRef = useRef(null)

  useEffect(() => {
    function place() {
      if (!anchorRef.current) return
      const r = anchorRef.current.getBoundingClientRect()
      const width = Math.min(340, window.innerWidth - 24)
      const maxLeft = window.innerWidth - width - 12
      const left = Math.max(12, Math.min(r.left, maxLeft))
      const maxHeight = Math.min(480, window.innerHeight - r.bottom - 20)
      setPos({ top: r.bottom + 6, left, width, maxHeight })
    }
    place()
    window.addEventListener('scroll', place, true)
    window.addEventListener('resize', place)
    return () => {
      window.removeEventListener('scroll', place, true)
      window.removeEventListener('resize', place)
    }
  }, [anchorRef])

  useEffect(() => {
    function onMouseDown(e) {
      if (!panelRef.current?.contains(e.target) && !anchorRef.current?.contains(e.target))
        onClose()
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [onClose, anchorRef])

  return createPortal(
    <div ref={panelRef} style={{
      position: 'fixed', top: pos.top, left: pos.left,
      background: '#fff', borderRadius: 14, border: '1.5px solid #e5e7eb',
      boxShadow: '0 12px 40px rgba(0,0,0,0.14)', zIndex: 9999,
      width: pos.width, maxHeight: Math.max(pos.maxHeight, 220), display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 18px', borderBottom: '1px solid #f0f0f0',
      }}>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#1a1a2e' }}>
          More Filters {activeCount > 0 && <span style={{ color: '#1d3a6e' }}>({activeCount})</span>}
        </span>
        <button onClick={onClose} style={{
          background: 'none', border: 'none', cursor: 'pointer', padding: 4,
          color: '#9ca3af', fontSize: 18, lineHeight: 1,
        }}>✕</button>
      </div>

      {/* Filter groups */}
      <div style={{ overflowY: 'auto', padding: '8px 0 16px' }}>
        {Object.entries(groups).map(([group, options]) => {
          const selected = activeSubFilters[group] ?? null
          return (
            <div key={group} style={{ padding: '12px 18px 8px' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                {group}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {options.map(opt => {
                  const isActive = selected === opt
                  return (
                    <button
                      key={opt}
                      onClick={() => onChange(group, isActive ? null : opt)}
                      style={{
                        padding: '6px 12px', borderRadius: 20, fontSize: 12.5, fontWeight: isActive ? 600 : 400,
                        cursor: 'pointer', border: `1.5px solid ${isActive ? '#1d3a6e' : '#e5e7eb'}`,
                        background: isActive ? '#1d3a6e' : '#f9fafb',
                        color: isActive ? '#fff' : '#374151',
                        transition: 'all 0.12s ease',
                      }}
                    >
                      {opt}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      {activeCount > 0 && (
        <div style={{ padding: '10px 18px', borderTop: '1px solid #f0f0f0' }}>
          <button
            onClick={() => { Object.keys(groups).forEach(g => onChange(g, null)); onClose() }}
            style={{
              width: '100%', padding: '9px', borderRadius: 99, fontSize: 13, fontWeight: 600,
              cursor: 'pointer', border: '1.5px solid #fca5a5', background: '#fff5f5', color: '#dc2626',
            }}
          >
            Clear these filters
          </button>
        </div>
      )}
    </div>,
    document.body
  )
}

/* ── Sub-filter config ── */
const SUB_FILTERS = {
  vehicles: {
    'Budget':       ['Under ₹1L','₹1–3L','₹3–5L','₹5–10L','₹10–20L','Above ₹20L'],
    'Make':         ['Maruti','Hyundai','Honda','Toyota','Tata','Mahindra','Kia','MG','Ford','Volkswagen','Skoda','Renault','Nissan'],
    'Body Type':    ['Hatchback','Sedan','SUV','MUV','Coupe','Convertible','Pickup'],
    'Fuel':         ['Petrol','Diesel','CNG','Electric','Hybrid'],
    'Transmission': ['Manual','Automatic','Semi-Automatic'],
    'Year':         ['2024','2023','2022','2021','2020','2019','2018','Before 2018'],
    'KM Driven':    ['Under 10K','10–30K','30–60K','60–100K','Above 100K'],
    'Owners':       ['1st Owner','2nd Owner','3rd Owner','4th Owner+'],
  },
  bikes: {
    'Budget':    ['Under ₹50K','₹50K–1L','₹1–2L','₹2–5L','Above ₹5L'],
    'Make':      ['Honda','Bajaj','Hero','TVS','Royal Enfield','Yamaha','Suzuki','KTM','Kawasaki','BMW','Harley'],
    'Type':      ['Commuter','Sports','Cruiser','Scooter','Adventure','Off-Road','Electric'],
    'Fuel':      ['Petrol','Electric'],
    'Year':      ['2024','2023','2022','2021','2020','Before 2020'],
    'KM Driven': ['Under 5K','5–15K','15–30K','30–60K','Above 60K'],
    'Owners':    ['1st Owner','2nd Owner','3rd Owner+'],
  },
  mobiles: {
    'Budget':    ['Under ₹5K','₹5–10K','₹10–20K','₹20–40K','₹40–70K','Above ₹70K'],
    'Brand':     ['Apple','Samsung','OnePlus','Xiaomi','Vivo','Oppo','Realme','Nothing','Google','Motorola'],
    'Storage':   ['32GB','64GB','128GB','256GB','512GB','1TB'],
    'RAM':       ['3GB','4GB','6GB','8GB','12GB','16GB'],
    'Network':   ['4G','5G'],
    'Condition': ['New','Like New','Good','Fair'],
    'Features':  ['With Box','Original Charger','Unlocked','Dual SIM'],
  },
  electronics: {
    'Budget':    ['Under ₹5K','₹5–15K','₹15–30K','₹30–60K','Above ₹60K'],
    'Type':      ['Laptops','Televisions','Cameras','Audio','Tablets','Smart Watch','Printers','Projectors'],
    'Brand':     ['Apple','Samsung','Sony','LG','Dell','HP','Lenovo','Asus','Acer','Bose','JBL'],
    'Condition': ['Brand New','Like New','Good','Needs Repair'],
  },
  property: {
    'Purpose':    ['For Rent','For Sale','PG / Hostel','Commercial Rent','Commercial Sale'],
    'Type':       ['Flat / Apartment','Independent House','Villa','Plot / Land','Builder Floor','Office Space','Shop'],
    'BHK':        ['1 RK','1 BHK','2 BHK','3 BHK','4 BHK','5 BHK+'],
    'Furnishing': ['Fully Furnished','Semi-Furnished','Unfurnished'],
    'Posted By':  ['Owner','Agent','Builder'],
    'Available':  ['Immediate','Within 15 Days','Within 1 Month','After 1 Month'],
  },
  furniture: {
    'Budget':    ['Under ₹2K','₹2–5K','₹5–15K','₹15–30K','Above ₹30K'],
    'Type':      ['Sofas','Beds','Dining Tables','Study Tables','Chairs','Wardrobes','Bookshelves','TV Units','Cabinets'],
    'Material':  ['Solid Wood','Engineered Wood','Metal','Fabric','Glass','Plastic'],
    'Condition': ['Brand New','Like New','Good','Needs Repair'],
  },
  fashion: {
    'Budget':    ['Under ₹500','₹500–2K','₹2–5K','₹5–15K','Above ₹15K'],
    'For':       ['Men','Women','Boys','Girls','Unisex'],
    'Category':  ['Clothing','Footwear','Watches','Bags & Wallets','Jewellery','Accessories','Eyewear','Belts'],
    'Brand':     ['Nike','Adidas','Puma','Zara','H&M','Levis','Allen Solly','Peter England','Fabindia'],
    'Condition': ['Brand New','Like New','Good'],
  },
  books: {
    'Budget':    ['Under ₹100','₹100–300','₹300–700','Above ₹700'],
    'Genre':     ['Fiction','Non-Fiction','Textbooks','Academic','Comics & Manga','Self Help','Biography','Science','History','Religion','Children'],
    'Language':  ['English','Hindi','Telugu','Tamil','Kannada','Malayalam','Marathi','Bengali','Gujarati'],
    'Condition': ['Brand New','Like New','Good','Acceptable'],
  },
  sports: {
    'Budget':    ['Under ₹500','₹500–2K','₹2–5K','₹5–15K','Above ₹15K'],
    'Sport':     ['Cricket','Football','Badminton','Tennis','Table Tennis','Basketball','Cycling','Gym & Fitness','Swimming','Yoga','Running','Golf'],
    'Type':      ['Equipment','Clothing','Footwear','Accessories','Outdoor Gear'],
    'Condition': ['Brand New','Like New','Good'],
  },
  pets: {
    'Animal':    ['Dogs','Cats','Birds','Fish & Aquarium','Rabbits','Hamsters','Turtles','Reptiles'],
    'Type':      ['Live Animals','Food & Treats','Accessories','Medicines','Cages & Kennels','Grooming'],
    'Budget':    ['Under ₹500','₹500–2K','₹2–5K','₹5–15K','Above ₹15K'],
  },
  gaming: {
    'Budget':    ['Under ₹1K','₹1–3K','₹3–8K','₹8–20K','Above ₹20K'],
    'Platform':  ['PlayStation 5','PlayStation 4','Xbox Series X/S','Xbox One','Nintendo Switch','PC Gaming','Mobile Gaming','Retro'],
    'Type':      ['Consoles','Games / CDs','Controllers','Headsets','VR Headsets','Gaming Chairs','Keyboards & Mouse'],
    'Condition': ['Brand New','Like New','Good'],
  },
  services: {
    'Category':  ['Home Services','Tech & IT','Beauty & Wellness','Education & Tutoring','Repair & Maintenance','Packers & Movers','Event Services','Healthcare','Legal & Finance','Photography'],
    'Mode':      ['On-Site','Online / Remote','Both'],
  },
  kids: {
    'Budget':    ['Under ₹500','₹500–2K','₹2–5K','₹5–10K','Above ₹10K'],
    'Category':  ['Toys & Games','Clothing','Books','Baby Gear','Strollers','Car Seats','Feeding','Educational','Sports','Art & Craft'],
    'Age Group': ['0–1 Year','1–3 Years','3–5 Years','5–8 Years','8–12 Years','12+ Years'],
    'Condition': ['Brand New','Like New','Good'],
  },
}

const INLINE_COUNT = 3

export default function Listings() {
  const { activeCategory, showToast, activeLocation, setPostOpen, user, setLoginOpen, setPendingAction, listingsKey } = useApp()
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeSubFilters, setActiveSubFilters] = useState({})
  const [moreOpen, setMoreOpen] = useState(false)
  const [view, setView] = useState(() => localStorage.getItem('bt_view') || 'grid')
  const moreBtnRef = useRef(null)

  function changeView(v) {
    setView(v)
    localStorage.setItem('bt_view', v)
  }

  useEffect(() => { setActiveSubFilters({}); setMoreOpen(false) }, [activeCategory])

  useEffect(() => {
    async function fetchListings() {
      setLoading(true)
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) showToast('Failed to load listings', '✕')
      else {
        const now = Date.now()
        const LIMIT = 48 * 3600 * 1000
        setListings((data ?? []).filter(l => {
          if (l.badge !== 'Sold' || !l.sold_at) return true
          return (now - new Date(l.sold_at).getTime()) < LIMIT
        }))
      }
      setLoading(false)
    }
    fetchListings()

    // Real-time: new listings appear instantly, image updates sync without refresh
    const channel = supabase
      .channel('listings-live')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'listings' },
        payload => setListings(prev => [payload.new, ...prev])
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'listings' },
        payload => {
          const l = payload.new
          const LIMIT = 48 * 3600 * 1000
          const expired = l.badge === 'Sold' && l.sold_at && (Date.now() - new Date(l.sold_at).getTime()) >= LIMIT
          if (expired) {
            setListings(prev => prev.filter(x => x.id !== l.id))
          } else {
            setListings(prev => prev.map(x => x.id === l.id ? l : x))
          }
        }
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'listings' },
        payload => setListings(prev => prev.filter(l => l.id !== payload.old.id))
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [listingsKey])

  function setSubFilter(group, val) {
    setActiveSubFilters(prev => {
      if (val === null) { const n = { ...prev }; delete n[group]; return n }
      return { ...prev, [group]: val }
    })
  }

  const filtered = useMemo(() => {
    let list = [...listings]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(l =>
        l.title?.toLowerCase().includes(q) ||
        l.location?.toLowerCase().includes(q) ||
        l.category?.toLowerCase().includes(q) ||
        l.tags?.some(t => t.toLowerCase().includes(q))
      )
    }

    if (activeCategory !== 'all') list = list.filter(l => l.category === activeCategory)
    if (activeLocation !== 'all') list = list.filter(l => l.location?.toLowerCase() === activeLocation.toLowerCase())

    Object.values(activeSubFilters).forEach(val => {
      const q = val.toLowerCase()
      list = list.filter(l =>
        l.title?.toLowerCase().includes(q) ||
        l.tags?.some(t => t.toLowerCase().includes(q)) ||
        l.description?.toLowerCase().includes(q)
      )
    })

    if (sort === 'price-asc')  list.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)

    return list
  }, [listings, activeCategory, activeSubFilters, sort, search, activeLocation])

  const allSubFilters = activeCategory !== 'all' ? SUB_FILTERS[activeCategory] : null
  const subFilterEntries = allSubFilters ? Object.entries(allSubFilters) : []
  const inlineFilters = Object.fromEntries(subFilterEntries.slice(0, INLINE_COUNT))
  const moreFilters  = Object.fromEntries(subFilterEntries.slice(INLINE_COUNT))
  const moreFilterKeys = Object.keys(moreFilters)
  const moreActiveCount = moreFilterKeys.filter(k => activeSubFilters[k]).length
  const totalActiveCount = Object.keys(activeSubFilters).length
  const hasAnyFilter = totalActiveCount > 0 || search.trim()

  return (
    <section id="listings" className="section">
      <div className="container">
        <VerifiedBanner />

        <div className="sec-head">
          <h2 className="sec-h">
            <small>Fresh near you</small>Latest Listings
          </h2>
        </div>

        {/* Filter + Sort bar — single line */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap',
        }}>

          {/* Search */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <SearchIcon size={13} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#9ca3af' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search listings…"
              style={{
                paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8,
                border: '1.5px solid #d1d5db', borderRadius: 99, fontSize: 13.5,
                background: '#fff', outline: 'none', width: 190, color: '#1a1a2e',
              }}
            />
          </div>

          {/* Inline sub-filter pills */}
          {Object.entries(inlineFilters).map(([group, options]) => (
            <FilterBtn
              key={group}
              label={group}
              options={options}
              value={activeSubFilters[group] ?? null}
              onChange={val => setSubFilter(group, val)}
            />
          ))}

          {/* More Filters button */}
          {moreFilterKeys.length > 0 && (
            <button
              ref={moreBtnRef}
              onClick={() => setMoreOpen(o => !o)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
                padding: '8px 13px', borderRadius: 99, whiteSpace: 'nowrap',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                border: `1.5px solid ${moreActiveCount > 0 || moreOpen ? '#1d3a6e' : '#d1d5db'}`,
                background: moreActiveCount > 0 ? '#1d3a6e' : moreOpen ? '#f0f4ff' : '#fff',
                color: moreActiveCount > 0 ? '#fff' : moreOpen ? '#1d3a6e' : '#374151',
                transition: 'all 0.15s ease',
              }}
            >
              <FilterIcon size={13} />
              Filters
              {moreActiveCount > 0 && (
                <span style={{
                  background: '#fff', color: '#1d3a6e', borderRadius: 10,
                  fontSize: 11, fontWeight: 700, padding: '1px 5px', minWidth: 16, textAlign: 'center',
                }}>
                  {moreActiveCount}
                </span>
              )}
              <ChevronIcon open={moreOpen} size={10} style={{ opacity: 0.7 }} />
            </button>
          )}

          {/* Clear — always visible, muted when nothing active */}
          <button
            onClick={() => { setActiveSubFilters({}); setSearch('') }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 5, flexShrink: 0,
              padding: '8px 13px', borderRadius: 99, fontSize: 13, fontWeight: 500,
              cursor: 'pointer',
              border: `1.5px solid ${hasAnyFilter ? '#fca5a5' : '#e5e7eb'}`,
              background: hasAnyFilter ? '#fff5f5' : '#fafafa',
              color: hasAnyFilter ? '#dc2626' : '#c4c4c4',
              transition: 'all 0.15s ease',
            }}
          >
            ✕ Clear
          </button>

          {/* Sort — pushed to right */}
          <div className="sort-wrap" style={{ marginLeft: 'auto' }}>
            <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <ChevronIcon open={false} size={12} className="sort-arrow" />
          </div>

          {/* Grid / List toggle — extreme right */}
          <div className="view-toggle">
            <button
              className={`view-toggle-btn${view === 'grid' ? ' active' : ''}`}
              onClick={() => changeView('grid')}
              title="Grid view"
            >
              <categoryIcons.all size={15} />
            </button>
            <button
              className={`view-toggle-btn${view === 'list' ? ' active' : ''}`}
              onClick={() => changeView('list')}
              title="List view"
            >
              <ListViewIcon size={15} />
            </button>
          </div>
        </div>

        {/* More Filters panel */}
        {moreOpen && moreFilterKeys.length > 0 && (
          <MoreFiltersPanel
            groups={moreFilters}
            activeSubFilters={activeSubFilters}
            onChange={setSubFilter}
            activeCount={moreActiveCount}
            onClose={() => setMoreOpen(false)}
            anchorRef={moreBtnRef}
          />
        )}

        {/* Listings Grid */}
        <div className={`lg${view === 'list' ? ' lg-list' : ''}`}>
          {loading ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
              <div style={{ color: 'var(--lilac)', fontSize: 15 }}>Loading listings…</div>
            </div>
          ) : filtered.length === 0 && hasAnyFilter ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--indigo)', marginBottom: 6 }}>No listings found</div>
              <div style={{ color: 'var(--lilac)', fontSize: 14, marginBottom: 20 }}>Try different filters or search terms</div>
              <button
                onClick={() => { setActiveSubFilters({}); setSearch('') }}
                style={{ padding: '10px 24px', borderRadius: 99, background: '#1d3a6e', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
              >Clear Filters</button>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🛍️</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--indigo)', marginBottom: 8 }}>
                Be the first to post!
              </div>
              <div style={{ color: 'var(--lilac)', fontSize: 14, marginBottom: 24, maxWidth: 340, margin: '0 auto 24px' }}>
                No listings yet in this category. Post your first ad — it's completely free and takes under 2 minutes.
              </div>
              <button
                onClick={() => {
                  if (!user) {
                    setPendingAction(() => () => setPostOpen(true))
                    setLoginOpen(true)
                  } else {
                    setPostOpen(true)
                  }
                }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '13px 28px', borderRadius: 99,
                  background: '#1d3a6e', color: '#fff',
                  border: 'none', cursor: 'pointer', fontSize: 15, fontWeight: 700,
                }}
              >
                <PostIcon size={15} />
                Post Free Ad
              </button>
            </div>
          ) : (
            filtered.map(l => <ListingCard key={l.id} listing={l} />)
          )}
        </div>

        {filtered.length > 0 && (
          <div className="load-more">
            <button
              className="btn btn-ghost"
              style={{ fontSize: 15, padding: '13px 36px' }}
              onClick={() => showToast('All listings loaded', 'ℹ️')}
            >
              {filtered.length} listing{filtered.length !== 1 ? 's' : ''} shown
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
