import { useApp } from '../context/AppContext'
import { categoryIcons } from '../data/categories.jsx'
import HeartIcon from './icons/HeartIcon'
import MapPinIcon from './icons/MapPinIcon'
import PostIcon from './icons/PostIcon'
import DocumentIcon from './icons/DocumentIcon'
import VerifiedShieldIcon from './icons/VerifiedShieldIcon'
import SpeechBubbleIcon from './icons/SpeechBubbleIcon'
import GlobeIcon from './icons/GlobeIcon'

const heroCards = [
  {
    cls: 'hcard-1', thumb: 'h1', badge: 'Featured', badgeCls: 'badge-new',
    title: 'Maruti Swift VXi 2021', price: '₹4,25,000', meta: 'Mumbai · 45,000 km',
    Icon: categoryIcons.vehicles,
  },
  {
    cls: 'hcard-2', thumb: 'h2', badge: 'Hot', badgeCls: 'badge-hot',
    title: 'iPhone 14 Pro 256GB', price: '₹72,000', meta: 'Bangalore · Excellent',
    Icon: categoryIcons.mobiles,
  },
  {
    cls: 'hcard-3', thumb: 'h3', badge: null, badgeCls: null,
    title: 'Royal Enfield 350', price: '₹1,65,000', meta: 'Chennai · 28K km',
    Icon: categoryIcons.bikes,
  },
  {
    cls: 'hcard-4', thumb: 'h4', badge: null, badgeCls: null,
    title: 'MacBook Air M2', price: '₹82,000', meta: 'Delhi · 8 months old',
    Icon: categoryIcons.electronics,
  },
]

const trustBadges = [
  { text: 'Free to post', Icon: DocumentIcon },
  { text: 'Email verified', Icon: VerifiedShieldIcon },
  { text: 'Direct chat', Icon: SpeechBubbleIcon },
  { text: 'All India', Icon: GlobeIcon },
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
            From preloved smartphones to classic cars — discover listings across every city in India. Free to post, free to buy.
          </p>

          <div className="hero-actions">
            <button className="btn btn-dark btn-lg hero-cta" onClick={() => setPostOpen(true)}>
              <PostIcon size={16} />
              Post Free Ad
            </button>
            <a href="#listings" className="btn btn-ghost btn-lg hero-cta">Browse Listings</a>
          </div>

          <div className="hero-trust" style={{ gap: 16 }}>
            {trustBadges.map(({ Icon, text }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 500, color: 'var(--grape)' }}>
                <span style={{ display: 'flex', alignItems: 'center', color: 'var(--grape)' }}><Icon size={14} /></span> {text}
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
                  <div className="hcard-save"><HeartIcon size={14} /></div>
                  <card.Icon size={38} style={{ opacity: 0.55 }} />
                </div>
                <div className="hcard-body">
                  <div className="hcard-title">{card.title}</div>
                  <div className="hcard-price">{card.price}</div>
                  <div className="hcard-meta">
                    <MapPinIcon size={10} /> {card.meta}
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
