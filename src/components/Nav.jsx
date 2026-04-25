import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
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
      <svg className="nav-search-icon" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
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
                    {r.images?.length > 0 ? <img src={r.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : r.emoji}
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
  } = useApp()

  const [open, setOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function close() { setOpen(false); setConfirmDelete(false) }

  function act(fn) { close(); setTimeout(fn, 50) }

  const MOBILE_NAV_H = 56

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
        <div style={{ padding: '14px 18px 12px', borderBottom: '1px solid #f3f4f6', background: '#fafafa' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Your Location
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="14" height="14" fill="#e8473f" stroke="none" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
              <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/>
              <circle cx="12" cy="9" r="2.5" fill="#fff"/>
            </svg>
            <span style={{ fontSize: 14.5, fontWeight: 700, color: '#1a1a2e', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {activeLocation === 'all' ? 'All India' : activeLocation}
            </span>
            <span className="ham-loc-wrap"><LocationPicker /></span>
          </div>
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

              <HamItem icon={<PostIcon />} label="Post Ad" onClick={() => act(() => setPostOpen(true))} accent />
              <HamItem icon={<AdsIcon />} label="My Ads" onClick={() => act(() => setMyAdsOpen(true))} />
              <HamItem icon={<HeartIcon filled={savedCount > 0} />} label="Wishlist" badge={savedCount} onClick={() => act(() => setFavouritesOpen(true))} />
              <HamItem icon={<CartIcon />} label="View Cart" badge={cart.length} onClick={() => act(() => setCartOpen(true))} />
              <HamItem icon={<ChatIcon />} label="Chats" badge={unreadCount} onClick={() => act(() => { setMessagesOpen(true); clearUnread() })} />

              <div style={{ height: 1, background: '#f3f4f6', margin: '6px 0' }} />

              <HamItem icon={<ProfileIcon />} label="Profile" onClick={() => act(() => setProfileOpen(true))} />
              <HamItem icon={<SignOutIcon />} label="Sign Out" onClick={() => act(logout)} />

              <div style={{ height: 1, background: '#f3f4f6', margin: '6px 0' }} />

              {!confirmDelete ? (
                <HamItem icon={<DeleteIcon />} label="Delete Account" danger onClick={() => setConfirmDelete(true)} />
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
              <HamItem icon={<CartIcon />} label="View Cart" badge={cart.length} onClick={() => act(() => setCartOpen(true))} />
              <HamItem icon={<PostIcon />} label="Post Ad" onClick={() => act(() => setLoginOpen(true))} accent />
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
        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          {open
            ? <path d="M18 6 6 18M6 6l12 12" />
            : <><path d="M4 6h16M4 12h16M4 18h16" /></>}
        </svg>
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

/* Small icon components */
const PostIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" /></svg>
)
const AdsIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 12h8M8 8h8M8 16h5"/></svg>
)
const HeartIcon = ({ filled }) => (
  <svg width="16" height="16" fill={filled ? '#e8473f' : 'none'} stroke={filled ? '#e8473f' : 'currentColor'} strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)
const CartIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
  </svg>
)
const ChatIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
)
const BellIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)
const ProfileIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
)
const SignOutIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
)
const DeleteIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24"><polyline points="3,6 5,6 21,6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
)

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

/* ── Main Nav ───────────────────────────────────────── */
export default function Nav() {
  const {
    setLoginOpen, setPostOpen, setProfileOpen,
    setMyAdsOpen, setMessagesOpen, setFavouritesOpen,
    setCartOpen,
    user, logout,
    unreadCount, clearUnread,
    savedCount, cart,
    activeLocation,
  } = useApp()
  useNavScroll()

  return (
    <nav id="nav">
      <a href="#" className="nav-logo">
        BazaarTrade<span className="nav-logo-dot" />in
      </a>

      <NavSearch />

      <div className="nav-right">
        {/* Location — web only (CSS hides on mobile) */}
        <LocationPicker />

        {/* Cart — visible on both web and mobile */}
        <button
          className="nav-icon-btn"
          onClick={() => setCartOpen(true)}
          title="Cart"
          style={{ position: 'relative' }}
        >
          <CartIcon />
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
          <HeartIcon filled={user && savedCount > 0} />
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
        <button className="nav-icon-btn nav-hide-mobile" onClick={() => { if (user) { setMessagesOpen(true); clearUnread() } else setLoginOpen(true) }} title="Chats">
          <ChatIcon />
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
        <button className="nav-icon-btn nav-hide-mobile" onClick={() => { if (user) { setMessagesOpen(true); clearUnread() } else setLoginOpen(true) }} title="Notifications">
          <BellIcon />
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
            <button className="btn btn-ghost btn-sm nav-hide-mobile" onClick={() => setMyAdsOpen(true)}>My Ads</button>
            <button className="btn btn-ghost btn-sm nav-hide-mobile" onClick={() => setProfileOpen(true)}>Profile</button>
            <button className="btn btn-ghost btn-sm nav-hide-mobile" onClick={logout}>Sign Out</button>
          </>
        ) : (
          <button className="btn btn-ghost btn-sm nav-hide-mobile" onClick={() => setLoginOpen(true)}>Sign In</button>
        )}

        {/* Post Ad — web only via CSS */}
        <button className="btn btn-dark btn-sm nav-hide-mobile" onClick={() => user ? setPostOpen(true) : setLoginOpen(true)}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Post Ad
        </button>

        {/* Hamburger — mobile only via CSS */}
        <HamburgerMenu />
      </div>
    </nav>
  )
}
