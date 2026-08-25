import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../context/AppContext'
import { useNavScroll } from '../hooks/useNavScroll'
import { useVerification } from '../hooks/useVerification'
import LocationPicker from './LocationPicker'
import { supabase } from '../lib/supabase'
import { formatPrice } from '../utils/format'
import CartIcon from './icons/CartIcon'
import HeartIcon from './icons/HeartIcon'
import ChatIcon from './icons/ChatIcon'
import BellIcon from './icons/BellIcon'
import MapPinIcon from './icons/MapPinIcon'
import SearchIcon from './icons/SearchIcon'
import PostIcon from './icons/PostIcon'
import AdsIcon from './icons/AdsIcon'
import ProfileIcon from './icons/ProfileIcon'
import SignOutIcon from './icons/SignOutIcon'
import DeleteIcon from './icons/DeleteIcon'
import ShieldIcon from './icons/ShieldIcon'
import GpsIcon from './icons/GpsIcon'
import HamburgerIcon from './icons/HamburgerIcon'
import ChevronIcon from './icons/ChevronIcon'

const GRAD_BG = {
  li1: 'linear-gradient(145deg,#ece4f0,#ddd4e8)',
  li2: 'linear-gradient(145deg,#f0e8e4,#e6d8d2)',
  li3: 'linear-gradient(145deg,#e4ecf0,#d4e2ea)',
  li4: 'linear-gradient(145deg,#eee8f0,#e0d6ea)',
  li5: 'linear-gradient(145deg,#f0ede4,#e6e0d2)',
  li6: 'linear-gradient(145deg,#e4f0ec,#d4eae2)',
}

/* ── Search ─────────────────────────────────────────── */
function NavSearch() {
  const { setActiveListing } = useApp()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const wrapRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    function onDown(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  function handleChange(e) {
    const q = e.target.value
    setQuery(q)
    clearTimeout(timerRef.current)
    if (q.trim().length < 2) { setResults([]); setOpen(false); setSearching(false); return }
    setSearching(true)
    timerRef.current = setTimeout(async () => {
      const { data } = await supabase
        .from('listings')
        .select('id, title, price, category, emoji, gradient, location, images, seller_name')
        .or(`title.ilike.%${q}%,category.ilike.%${q}%,location.ilike.%${q}%,description.ilike.%${q}%`)
        .order('created_at', { ascending: false })
        .limit(8)
      setResults(data ?? [])
      setOpen(true)
      setSearching(false)
    }, 280)
  }

  function handleSelect(listing) {
    setActiveListing(listing)
    setQuery('')
    setOpen(false)
    setResults([])
  }

  const showDrop = open && query.trim().length >= 2

  return (
    <div ref={wrapRef} className="nav-search" style={{ position: 'relative' }}>
      <SearchIcon size={15} className="nav-search-icon" />
      <input
        type="text"
        placeholder="Search mobiles, cars, property…"
        value={query}
        onChange={handleChange}
        onFocus={() => results.length > 0 && setOpen(true)}
        onKeyDown={e => e.key === 'Escape' && (setOpen(false), setQuery(''))}
        autoComplete="off"
      />
      {query && (
        <button
          onClick={() => { setQuery(''); setResults([]); setOpen(false) }}
          style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--lilac)', fontSize: 14, lineHeight: 1, padding: 2 }}
        >✕</button>
      )}
      {showDrop && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0, background: '#fff', borderRadius: 14, border: '1.5px solid #e5e7eb', boxShadow: '0 12px 40px rgba(0,0,0,0.13)', zIndex: 9999, overflow: 'hidden', minWidth: 340 }}>
          {searching ? (
            <div style={{ padding: '18px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>Searching…</div>
          ) : results.length === 0 ? (
            <div style={{ padding: '18px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 6 }}>🔍</div>
              <div style={{ fontSize: 13, color: '#9ca3af' }}>No results for "{query}"</div>
            </div>
          ) : (
            <>
              <div style={{ padding: '10px 14px 6px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
              </div>
              {results.map(r => (
                <div
                  key={r.id}
                  onClick={() => handleSelect(r)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', cursor: 'pointer', borderTop: '1px solid #f3f4f6', transition: 'background 0.12s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ width: 44, height: 44, borderRadius: 8, flexShrink: 0, background: GRAD_BG[r.gradient] || GRAD_BG.li1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, overflow: 'hidden' }}>
                    {r.images?.length > 0 ? <img src={r.images[0]} alt={r.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : r.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                    <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 2 }}>{r.location} · {r.category}</div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1a2e', flexShrink: 0 }}>{formatPrice(r.price)}</div>
                </div>
              ))}
              <div style={{ padding: '10px 14px', borderTop: '1px solid #f3f4f6', textAlign: 'center' }}>
                <span style={{ fontSize: 12, color: '#9ca3af' }}>Click any result to view details</span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Hamburger drawer (mobile) ──────────────────────── */
function HamburgerMenu() {
  const {
    user, logout, deleteAccount,
    setLoginOpen, setPostOpen, setProfileOpen,
    setMyAdsOpen, setMessagesOpen, setFavouritesOpen,
    cartOpen, setCartOpen,
    unreadCount, clearUnread,
    savedCount, cart,
    activeLocation, setActiveLocation,
    adminOpen, setAdminOpen, isAdminUser, isSEOUser,
    notifOpen, setNotifOpen,
    setActiveListing,
  } = useApp()

  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [geoLocating, setGeoLocating] = useState(false)
  const [geoError, setGeoError] = useState('')

  function close() { setOpen(false); setConfirmDelete(false) }

  function act(fn) { close(); setTimeout(fn, 50) }

  const MOBILE_NAV_H = 56

  async function handleGeolocate() {
    if (!navigator.geolocation) { setGeoError('Geolocation not supported.'); return }
    setGeoLocating(true); setGeoError('')
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=10`,
            { headers: { 'Accept-Language': 'en-IN,en', 'User-Agent': 'BazaarTrade/1.0' } }
          )
          const data = await res.json()
          const a = data.address || {}
          const candidates = [a.city, a.town, a.municipality, a.village, a.suburb, a.county]
          // find in locations data
          const { states: locationStates } = await import('../data/locations')
          let matched = null
          for (const name of candidates) {
            if (!name) continue
            const lc = name.toLowerCase().trim()
            if (!lc) continue
            for (const s of locationStates) {
              for (const c of s.cities) {
                const cl = c.toLowerCase()
                const subMatch = cl.length >= 4 && lc.length >= 4 && (lc.includes(cl) || cl.includes(lc))
                if (cl === lc || subMatch) {
                  matched = c; break
                }
              }
              if (matched) break
            }
            if (matched) break
          }
          if (matched) {
            setActiveLocation(matched)
            setGeoLocating(false)
          } else {
            setGeoError(`Detected "${candidates.find(Boolean) || 'unknown'}" — not in our list. Choose manually.`)
            setGeoLocating(false)
          }
        } catch {
          setGeoError('Location fetch failed. Choose manually below.')
          setGeoLocating(false)
        }
      },
      (err) => {
        setGeoError(err.code === 1 ? 'Location access denied.' : 'Could not get location.')
        setGeoLocating(false)
      },
      { timeout: 12000, maximumAge: 600000 }
    )
  }

  // Drawer content — portalled to body to escape backdrop-filter stacking context on #nav
  const drawerContent = createPortal(
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={close}
          style={{
            position: 'fixed', top: MOBILE_NAV_H, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.45)', zIndex: 1490,
          }}
        />
      )}

      {/* Drawer — always in DOM for CSS transition */}
      <div style={{
        position: 'fixed',
        top: MOBILE_NAV_H,
        right: 0,
        bottom: 0,
        width: 280,
        background: '#fff',
        zIndex: 1500,
        overflowY: 'auto',
        transform: open ? 'translateX(0)' : 'translateX(110%)',
        transition: 'transform 0.26s cubic-bezier(.4,0,.2,1)',
        boxShadow: '-8px 0 40px rgba(0,0,0,0.18)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Location section */}
        <div style={{ borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
          <div style={{ padding: '12px 18px 8px', fontSize: 10.5, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Your Location
          </div>

          {/* Current city display */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 18px 10px' }}>
            <MapPinIcon size={14} filled style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeLocation === 'all' ? 'All India' : activeLocation}
            </span>
            <span className="ham-loc-wrap"><LocationPicker /></span>
          </div>

          {/* Use my location button */}
          <button
            onClick={handleGeolocate}
            disabled={geoLocating}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 18px', background: geoLocating ? '#f5f3ff' : '#f0edf7',
              border: 'none', borderTop: '1px solid #ece8f8',
              cursor: geoLocating ? 'default' : 'pointer',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!geoLocating) e.currentTarget.style.background = '#e8e2f5' }}
            onMouseLeave={e => e.currentTarget.style.background = geoLocating ? '#f5f3ff' : '#f0edf7'}
          >
            {geoLocating ? (
              <div style={{ width: 16, height: 16, border: '2px solid #c9b8f0', borderTopColor: '#4a4e69', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
            ) : (
              <GpsIcon size={15} style={{ flexShrink: 0, color: '#4a4e69' }} />
            )}
            <span style={{ fontSize: 13, fontWeight: 600, color: '#4a4e69' }}>
              {geoLocating ? 'Detecting your location…' : 'Use my location'}
            </span>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </button>

          {geoError && (
            <div style={{ padding: '8px 18px', fontSize: 12, color: '#92400e', background: '#fff7ed', borderTop: '1px solid #fed7aa' }}>
              {geoError}
            </div>
          )}
        </div>

        {/* Menu items */}
        <div style={{ flex: 1 }}>
          {user ? (
            <>
              {/* User info */}
              <div style={{ padding: '14px 18px 10px', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1a1a2e' }}>
                  {user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0]}
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{user.email || user.phone}</div>
              </div>

              <HamItem icon={<PostIcon size={16} />} label="Post Ad" onClick={() => act(() => setPostOpen(true))} accent />
              <HamItem icon={<AdsIcon size={16} />} label="My Ads" onClick={() => act(() => setMyAdsOpen(true))} />
              <HamItem icon={<HeartIcon size={16} filled={savedCount > 0} />} label="Wishlist" badge={savedCount} onClick={() => act(() => setFavouritesOpen(true))} />
              <HamItem icon={<ChatIcon size={16} />} label="Chats" onClick={() => act(() => { setNotifOpen(false); setMessagesOpen(true) })} />
              <HamItem icon={<BellIcon size={16} />} label="Notifications" badge={unreadCount} onClick={() => act(() => { setMessagesOpen(false); setNotifOpen(true) })} />

              <div style={{ height: 1, background: '#f3f4f6', margin: '6px 0' }} />

              <HamItem icon={<ProfileIcon size={16} />} label="Profile" onClick={() => act(() => { setActiveListing(null); setCartOpen(false); setProfileOpen(true) })} />
              {(isAdminUser || isSEOUser) && (
                <HamItem icon={<ShieldIcon size={16} />} label={isAdminUser ? 'Admin Panel' : 'SEO Panel'} onClick={() => act(() => setAdminOpen(true))} />
              )}
              <HamItem icon={<SignOutIcon size={16} />} label="Sign Out" onClick={() => act(logout)} />

              <div style={{ height: 1, background: '#f3f4f6', margin: '6px 0' }} />

              {!confirmDelete ? (
                <HamItem icon={<DeleteIcon size={16} />} label="Delete Account" danger onClick={() => setConfirmDelete(true)} />
              ) : (
                <div style={{ padding: '12px 18px', background: '#fff5f5', borderTop: '1px solid #fee2e2' }}>
                  <p style={{ fontSize: 12.5, color: '#991b1b', fontWeight: 600, marginBottom: 10 }}>
                    This will permanently delete all your listings, messages, and account data.
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => { close(); deleteAccount() }}
                      style={{ flex: 1, padding: '8px 0', background: '#e8473f', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
                    >
                      Yes, delete
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      style={{ flex: 1, padding: '8px 0', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div style={{ padding: '18px 18px 12px' }}>
                <p style={{ fontSize: 13.5, color: '#6b7280', marginBottom: 14 }}>Sign in to access all features</p>
                <button
                  onClick={() => act(() => setLoginOpen(true))}
                  style={{ width: '100%', padding: '11px 0', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: 'pointer' }}
                >
                  Sign In
                </button>
              </div>
              <HamItem icon={<PostIcon size={16} />} label="Post Ad" onClick={() => act(() => setLoginOpen(true))} accent />
            </>
          )}
        </div>
      </div>
    </>,
    document.body
  )

  return (
    <>
      {/* Hamburger button — shown on mobile via CSS */}
      <button
        className="ham-btn"
        onClick={() => setOpen(o => !o)}
        aria-label="Menu"
        style={{ position: 'relative' }}
      >
        <HamburgerIcon open={open} size={20} />
        {user && unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: -2, right: -4,
            minWidth: 16, height: 16, borderRadius: 99,
            background: '#e8473f', color: '#fff',
            fontSize: 9, fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid #faf8f7', padding: '0 3px',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {drawerContent}
    </>
  )
}


function HamItem({ icon, label, badge, danger, accent, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 12,
        padding: '13px 18px', background: 'none', border: 'none', cursor: 'pointer',
        color: danger ? '#e8473f' : accent ? '#1d3a6e' : '#374151',
        fontSize: 14, fontWeight: danger || accent ? 700 : 500,
        borderBottom: '1px solid #f9fafb',
        textAlign: 'left',
      }}
      onMouseEnter={e => e.currentTarget.style.background = danger ? '#fff5f5' : '#f9fafb'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      <span style={{ color: danger ? '#e8473f' : accent ? '#1d3a6e' : '#6b7280', flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge > 0 && (
        <span style={{
          minWidth: 20, height: 20, borderRadius: 99,
          background: danger ? '#e8473f' : '#1d3a6e',
          color: '#fff', fontSize: 10, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 5px',
        }}>
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  )
}

/* ── Account dropdown (web) ─────────────────────────── */
function UserMenu() {
  const {
    user, logout, unreadCount,
    setMyAdsOpen, setProfileOpen, setProfileTab,
    setActiveListing, setCartOpen,
  } = useApp()
  const { isVerified } = useVerification(user)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, right: 0 })
  const btnRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    function onDown(e) {
      if (!btnRef.current?.contains(e.target) && !menuRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  function toggle() {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect()
      setPos({ top: r.bottom + window.scrollY + 8, right: window.innerWidth - r.right })
    }
    setOpen(o => !o)
  }

  function goProfile(tab) {
    setOpen(false)
    setActiveListing(null)
    setCartOpen(false)
    setProfileTab(tab)
    setProfileOpen(true)
  }

  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Account'
  const firstName = name.split(' ')[0]
  const initials = name[0]?.toUpperCase() || '?'

  const items = [
    { label: 'My Profile', onClick: () => goProfile('basic') },
    { label: 'My Ads', onClick: () => { setOpen(false); setMyAdsOpen(true) } },
    { label: 'My Addresses', onClick: () => goProfile('addresses') },
    { label: isVerified ? 'Verified ✓' : 'Get Verified', onClick: () => goProfile('basic') },
    { label: 'Account Settings', onClick: () => goProfile('security') },
  ]

  return (
    <>
      <button ref={btnRef} onClick={toggle} className="btn btn-ghost btn-sm nav-hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 7, position: 'relative' }}>
        <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#4a4e69', color: '#fff', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 }}>
          {user?.user_metadata?.avatar_url
            ? <img src={user.user_metadata.avatar_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : initials}
        </span>
        {firstName}
        {unreadCount > 0 && (
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#e8473f' }} />
        )}
        <ChevronIcon open={open} size={10} style={{ opacity: 0.7 }} />
      </button>

      {open && createPortal(
        <div ref={menuRef} style={{
          position: 'absolute', top: pos.top, right: pos.right,
          background: '#fff', borderRadius: 12, border: '1.5px solid #e5e7eb',
          boxShadow: '0 12px 40px rgba(0,0,0,0.13)', zIndex: 9999, minWidth: 200, overflow: 'hidden',
        }}>
          {items.map(item => (
            <button
              key={item.label} onClick={item.onClick}
              style={{
                width: '100%', textAlign: 'left', padding: '10px 16px', background: 'none', border: 'none',
                borderBottom: '1px solid #f3f4f6', cursor: 'pointer', fontSize: 13, color: '#374151',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              {item.label}
            </button>
          ))}
          <button
            onClick={() => { setOpen(false); logout() }}
            style={{ width: '100%', textAlign: 'left', padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#dc2626' }}
            onMouseEnter={e => e.currentTarget.style.background = '#fff5f5'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            Sign Out
          </button>
        </div>,
        document.body
      )}
    </>
  )
}

/* ── Main Nav ───────────────────────────────────────── */
export default function Nav() {
  const {
    setLoginOpen, setPostOpen,
    setMessagesOpen, setFavouritesOpen,
    setCartOpen,
    user,
    unreadCount, clearUnread,
    savedCount, cart,
    activeLocation,
    setAdminOpen, isAdminUser, isSEOUser,
    setNotifOpen,
    setActiveListing, setActiveCategory,
  } = useApp()
  useNavScroll()

  function goHome(e) {
    e.preventDefault()
    setActiveListing(null)
    setActiveCategory('all')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <nav id="nav">
      <a href="/" className="nav-logo" onClick={goHome}>
        BazaarTrade<span className="nav-logo-dot" />in
      </a>

      <NavSearch />

      <div className="nav-right">
        {/* Location — web only (CSS hides on mobile) */}
        <LocationPicker />

        {/* Cart — visible on both web and mobile */}
        <button
          className="nav-icon-btn"
          onClick={() => { setActiveListing(null); setCartOpen(true) }}
          title="Cart"
          style={{ position: 'relative' }}
        >
          <CartIcon size={16} />
          {cart.length > 0 && (
            <span style={{
              position: 'absolute', top: 2, right: 2,
              minWidth: 16, height: 16, borderRadius: 99,
              background: '#1d3a6e', color: '#fff',
              fontSize: 9, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid #faf8f7', padding: '0 3px',
            }}>
              {cart.length > 9 ? '9+' : cart.length}
            </span>
          )}
        </button>

        {/* Wishlist / Saved — web only via CSS */}
        <button className="nav-icon-btn nav-hide-mobile" onClick={() => user ? setFavouritesOpen(true) : setLoginOpen(true)} title="Saved">
          <HeartIcon size={16} filled={user && savedCount > 0} />
          {user && savedCount > 0 && (
            <span style={{
              position: 'absolute', top: 2, right: 2,
              minWidth: 16, height: 16, borderRadius: 99,
              background: '#e8473f', color: '#fff',
              fontSize: 9, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid #faf8f7', padding: '0 3px',
            }}>
              {savedCount > 9 ? '9+' : savedCount}
            </span>
          )}
        </button>

        {/* Chats — web only via CSS */}
        <button className="nav-icon-btn nav-hide-mobile" onClick={() => { if (user) { setNotifOpen(false); setMessagesOpen(true) } else { setLoginOpen(true) } }} title="Chats">
          <ChatIcon size={16} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: 2, right: 2,
              minWidth: 16, height: 16, borderRadius: 99,
              background: '#e8473f', color: '#fff',
              fontSize: 9, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid #faf8f7', padding: '0 3px',
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Notifications bell — web only via CSS */}
        <button className="nav-icon-btn nav-hide-mobile" onClick={() => { if (user) { setMessagesOpen(false); setNotifOpen(true) } else { setLoginOpen(true) } }} title="Notifications">
          <BellIcon size={16} />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: 2, right: 2,
              minWidth: 16, height: 16, borderRadius: 99,
              background: '#e8473f', color: '#fff',
              fontSize: 9, fontWeight: 800,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid #faf8f7', padding: '0 3px',
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* Web text buttons */}
        {user ? (
          <>
            {(isAdminUser || isSEOUser) && (
              <button
                className="btn btn-sm nav-hide-mobile"
                onClick={() => setAdminOpen(true)}
                title={isAdminUser ? 'Admin Panel' : 'SEO Panel'}
                style={{ background: 'linear-gradient(135deg,#1a1a2e,#2d3561)', color: '#fff', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <ShieldIcon size={14} /> {isAdminUser ? 'Admin' : 'SEO'}
              </button>
            )}
            <UserMenu />
          </>
        ) : (
          <button className="btn btn-ghost btn-sm nav-hide-mobile" onClick={() => setLoginOpen(true)}>Sign In</button>
        )}

        {/* Post Ad — web only via CSS */}
        <button className="btn btn-dark btn-sm nav-hide-mobile" onClick={() => user ? setPostOpen(true) : setLoginOpen(true)}>
          <PostIcon size={13} />
          Post Ad
        </button>

        {/* Hamburger — mobile only via CSS */}
        <HamburgerMenu />
      </div>
    </nav>
  )
}
