import { useApp } from '../context/AppContext'
import { useNavScroll } from '../hooks/useNavScroll'

export default function Nav() {
  const { showToast, setLoginOpen, setPostOpen } = useApp()
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
        <input type="text" placeholder="Search mobiles, cars, furniture…" />
      </div>

      <div className="nav-right">
        <button className="nav-city" onClick={() => showToast('Showing results near Mumbai', '📍')}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z" />
            <circle cx="12" cy="9" r="2.5" />
          </svg>
          Mumbai
        </button>

        <button className="nav-icon-btn" onClick={() => setLoginOpen(true)} title="Saved">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        <button className="nav-icon-btn" onClick={() => setLoginOpen(true)} title="Messages">
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="notif-dot" />
        </button>

        <button className="btn btn-ghost btn-sm" onClick={() => setLoginOpen(true)}>Sign In</button>
        <button className="btn btn-dark btn-sm" onClick={() => setPostOpen(true)}>
          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Post Ad
        </button>
      </div>
    </nav>
  )
}
