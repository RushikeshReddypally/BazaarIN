import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { useNavScroll } from '../hooks/useNavScroll'
import LocationPicker from './LocationPicker'
import { supabase } from '../lib/supabase'
import { formatPrice } from '../utils/format'

const GRAD_BG = {
  li1: 'linear-gradient(145deg,#ece4f0,#ddd4e8)',
  li2: 'linear-gradient(145deg,#f0e8e4,#e6d8d2)',
  li3: 'linear-gradient(145deg,#e4ecf0,#d4e2ea)',
  li4: 'linear-gradient(145deg,#eee8f0,#e0d6ea)',
  li5: 'linear-gradient(145deg,#f0ede4,#e6e0d2)',
  li6: 'linear-gradient(145deg,#e4f0ec,#d4eae2)',
}

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

  function handleKey(e) {
    if (e.key === 'Escape') { setOpen(false); setQuery('') }
  }

  const showDrop = open && query.trim().length >= 2

  return (
    <div ref={wrapRef} className="nav-search" style={{ position: 'relative' }}>
      <svg className="nav-search-icon" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
      <input
        type="text"
        placeholder="Search mobiles, cars, property…"
        value={query}
        onChange={handleChange}
        onFocus={() => results.length > 0 && setOpen(true)}
        onKeyDown={handleKey}
        autoComplete="off"
      />
      {query && (
        <button
          onClick={() => { setQuery(''); setResults([]); setOpen(false) }}
          style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--lilac)', fontSize: 14, lineHeight: 1, padding: 2,
          }}
        >✕</button>
      )}

      {showDrop && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
          background: '#fff', borderRadius: 14, border: '1.5px solid #e5e7eb',
          boxShadow: '0 12px 40px rgba(0,0,0,0.13)', zIndex: 9999,
          overflow: 'hidden', minWidth: 340,
        }}>
          {searching ? (
            <div style={{ padding: '18px 16px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
              Searching…
            </div>
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
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', cursor: 'pointer',
                    borderTop: '1px solid #f3f4f6',
                    transition: 'background 0.12s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Thumbnail */}
                  <div style={{
                    width: 44, height: 44, borderRadius: 8, flexShrink: 0,
                    background: GRAD_BG[r.gradient] || GRAD_BG.li1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20, overflow: 'hidden', position: 'relative',
                  }}>
                    {r.images?.length > 0
                      ? <img src={r.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : r.emoji}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {r.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#9ca3af', marginTop: 2 }}>
                      {r.location} · {r.category}
                    </div>
                  </div>
                  {/* Price */}
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#1a1a2e', flexShrink: 0 }}>
                    {formatPrice(r.price)}
                  </div>
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

export default function Nav() {
  const {
    setLoginOpen, setPostOpen, setProfileOpen,
    setMyAdsOpen, setMessagesOpen, setFavouritesOpen,
    user, logout,
    unreadCount, clearUnread,
  } = useApp()
  useNavScroll()

  return (
    <nav id="nav">
      <a href="#" className="nav-logo">
        BazaarTrade<span className="nav-logo-dot" />in
      </a>

      <NavSearch />

      <div className="nav-right">
        <LocationPicker />

        {/* Saved / Wishlist */}
        <button className="nav-icon-btn" onClick={() => user ? setFavouritesOpen(true) : setLoginOpen(true)} title="Saved">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Messages */}
        <button className="nav-icon-btn" onClick={() => { if (user) { setMessagesOpen(true); clearUnread() } else setLoginOpen(true) }} title="Messages">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
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

        {user ? (
          <>
            <button className="btn btn-ghost btn-sm nav-hide-mobile" onClick={() => setMyAdsOpen(true)}>My Ads</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setProfileOpen(true)}>Profile</button>
            <button className="btn btn-ghost btn-sm nav-hide-mobile" onClick={logout}>Sign Out</button>
          </>
        ) : (
          <button className="btn btn-ghost btn-sm" onClick={() => setLoginOpen(true)}>Sign In</button>
        )}

        <button className="btn btn-dark btn-sm" onClick={() => user ? setPostOpen(true) : setLoginOpen(true)}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Post Ad
        </button>
      </div>
    </nav>
  )
}
