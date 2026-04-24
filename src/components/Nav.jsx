import { useApp } from '../context/AppContext'
import { useNavScroll } from '../hooks/useNavScroll'
import LocationPicker from './LocationPicker'

export default function Nav() {
  const {
    setLoginOpen, setPostOpen, setProfileOpen,
    setMyAdsOpen, setMessagesOpen, setFavouritesOpen,
    user, logout, search, setSearch,
    unreadCount, clearUnread,
  } = useApp()
  useNavScroll()

  return (
    <nav id="nav">
      <a href="#" className="nav-logo">
        Bazaar<span className="nav-logo-dot" />IN
      </a>

      <div className="nav-search">
        <svg className="nav-search-icon" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search mobiles, cars, furniture…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="nav-right">
        <LocationPicker />

        {/* Saved / Wishlist */}
        <button
          className="nav-icon-btn"
          onClick={() => user ? setFavouritesOpen(true) : setLoginOpen(true)}
          title="Saved"
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Messages */}
        <button
          className="nav-icon-btn"
          onClick={() => { if (user) { setMessagesOpen(true); clearUnread() } else setLoginOpen(true) }}
          title="Messages"
        >
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
              border: '1.5px solid #faf8f7',
              padding: '0 3px',
            }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {user ? (
          <>
            <button className="btn btn-ghost btn-sm" onClick={() => setMyAdsOpen(true)}>My Ads</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setProfileOpen(true)}>Profile</button>
            <button className="btn btn-ghost btn-sm" onClick={logout}>Sign Out</button>
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
