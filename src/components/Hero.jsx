import { useApp } from '../context/AppContext'

const heroCards = [
  {
    cls: 'hcard-1', thumb: 'h1', badge: 'Featured', badgeCls: 'badge-new',
    title: 'Maruti Swift VXi 2021', price: '₹4,25,000', meta: 'Mumbai · 45,000 km',
    icon: (
      <svg width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ opacity: 0.55 }}>
        <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14l4 4v4a2 2 0 0 1-2 2h-2" />
        <circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
      </svg>
    ),
  },
  {
    cls: 'hcard-2', thumb: 'h2', badge: 'Hot', badgeCls: 'badge-hot',
    title: 'iPhone 14 Pro 256GB', price: '₹72,000', meta: 'Bangalore · Excellent',
    icon: (
      <svg width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ opacity: 0.55 }}>
        <rect x="5" y="2" width="14" height="20" rx="2"/>
        <line x1="12" y1="18" x2="12.01" y2="18"/>
      </svg>
    ),
  },
  {
    cls: 'hcard-3', thumb: 'h3', badge: null, badgeCls: null,
    title: 'Royal Enfield 350', price: '₹1,65,000', meta: 'Chennai · 28K km',
    icon: (
      <svg width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ opacity: 0.55 }}>
        <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
        <path d="M15 6h-3l-3 8m0 0H5.5m6.5 0 2-5.5" /><path d="M12 6l2 5.5"/>
      </svg>
    ),
  },
  {
    cls: 'hcard-4', thumb: 'h4', badge: null, badgeCls: null,
    title: 'MacBook Air M2', price: '₹82,000', meta: 'Delhi · 8 months old',
    icon: (
      <svg width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ opacity: 0.55 }}>
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8M12 17v4"/>
      </svg>
    ),
  },
]

const trustBadges = [
  {
    text: 'Free to post',
    icon: (
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
      </svg>
    ),
  },
  {
    text: 'Email verified',
    icon: (
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <polyline points="9 12 11 14 15 10"/>
      </svg>
    ),
  },
  {
    text: 'Direct chat',
    icon: (
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    text: 'All India',
    icon: (
      <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  },
]

const SaveIcon = () => (
  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

const PinIcon = () => (
  <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z"/>
  </svg>
)

export default function Hero() {
  const { setPostOpen } = useApp()

  return (
    <section id="hero">
      <div className="hero-noise" />
      <div className="hero-ring" />
      <div className="hero-ring" />

      <div className="hero-inner container" style={{ maxWidth: 1200 }}>
        {/* Left */}
        <div className="hero-left">
          <div className="hero-eyebrow">India's Trusted Marketplace</div>

          <h1 className="hero-h">
            Buy &amp; Sell<br />
            <em>Anything</em><br />
            <span>Across India</span>
          </h1>

          <p className="hero-desc">
            From preloved smartphones to classic cars — discover listings across every city in India. Free to post, free to buy.
          </p>

          <div className="hero-actions">
            <button className="btn btn-dark btn-lg" style={{ width: 210, height: 54, boxSizing: 'border-box', justifyContent: 'center' }} onClick={() => setPostOpen(true)}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Post Free Ad
            </button>
            <a href="#listings" className="btn btn-ghost btn-lg" style={{ width: 210, height: 54, boxSizing: 'border-box', justifyContent: 'center' }}>Browse Listings</a>
          </div>

          <div className="hero-trust" style={{ gap: 16 }}>
            {trustBadges.map(({ icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 500, color: 'var(--grape)' }}>
                <span style={{ display: 'flex', alignItems: 'center', color: 'var(--grape)' }}>{icon}</span> {text}
              </div>
            ))}
          </div>
        </div>

        {/* Right — floating cards */}
        <div className="hero-right">
          <div className="hero-card-stack">
            {heroCards.map(card => (
              <div key={card.cls} className={`hcard ${card.cls}`}>
                <div className={`hcard-thumb ${card.thumb}`}>
                  {card.badge && (
                    <div className={`hcard-badge ${card.badgeCls}`}>{card.badge}</div>
                  )}
                  <div className="hcard-save"><SaveIcon /></div>
                  {card.icon}
                </div>
                <div className="hcard-body">
                  <div className="hcard-title">{card.title}</div>
                  <div className="hcard-price">{card.price}</div>
                  <div className="hcard-meta">
                    <PinIcon /> {card.meta}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
