import { useApp } from '../context/AppContext'

const heroCards = [
  { cls: 'hcard-1', thumb: 'h1', badge: 'Featured', badgeCls: 'badge-new', emoji: '🚗', title: 'Maruti Swift VXi 2021',  price: '₹4,25,000', meta: '📍 Mumbai · 45,000 km' },
  { cls: 'hcard-2', thumb: 'h2', badge: 'Hot',      badgeCls: 'badge-hot', emoji: '📱', title: 'iPhone 14 Pro 256GB',   price: '₹72,000',   meta: '📍 Bangalore · Excellent' },
  { cls: 'hcard-3', thumb: 'h3', badge: null,        badgeCls: null,        emoji: '🏍️', title: 'Royal Enfield 350',    price: '₹1,65,000', meta: '📍 Chennai · 28K km' },
  { cls: 'hcard-4', thumb: 'h4', badge: null,        badgeCls: null,        emoji: '💻', title: 'MacBook Air M2',       price: '₹82,000',   meta: '📍 Delhi · 8 months' },
]

const faces = [
  ['RS', '#4a4e69'],
  ['PK', '#9a8c98'],
  ['AM', '#c9ada7'],
  ['DV', '#22223b'],
]

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
            From preloved smartphones to classic cars — discover millions of listings across 18 cities. Free to post, free to buy.
          </p>

          <div className="hero-actions">
            <button className="btn btn-dark btn-lg" onClick={() => setPostOpen(true)}>
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Post Free Ad
            </button>
            <a href="#listings" className="btn btn-ghost btn-lg">Browse Listings</a>
          </div>

          <div className="hero-search-bar">
            <select className="hsb-select">
              <option>All</option>
              <option>Vehicles</option>
              <option>Mobiles</option>
              <option>Property</option>
              <option>Furniture</option>
              <option>Electronics</option>
            </select>
            <input className="hsb-input" type="text" placeholder="e.g. iPhone 14 Pro, Maruti Swift…" />
            <button className="hsb-btn">
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
              Search
            </button>
          </div>

          <div className="hero-trust">
            <div className="trust-faces">
              {faces.map(([initials, color]) => (
                <div key={initials} className="trust-face" style={{ background: color }}>{initials}</div>
              ))}
            </div>
            <div className="trust-text"><strong>24 lakh+</strong> happy traders across India</div>
            <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
              <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: '-.5px' }}>2.4M+</span>
              <span style={{ fontSize: 11, color: 'var(--lilac)', paddingTop: 3 }}>Listings</span>
            </div>
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
                  <div className="hcard-save">🤍</div>
                  {card.emoji}
                </div>
                <div className="hcard-body">
                  <div className="hcard-title">{card.title}</div>
                  <div className="hcard-price">{card.price}</div>
                  <div className="hcard-meta">{card.meta}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
