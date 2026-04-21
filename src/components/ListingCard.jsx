import { useApp } from '../context/AppContext'
import { formatPriceFull, formatPrice } from '../utils/format'

export default function ListingCard({ listing }) {
  const { showToast } = useApp()
  const { title, price, originalPrice, emoji, gradient, badge, badgeClass, seller, location, time, tags, verified } = listing

  return (
    <div className="lc" onClick={() => showToast(`Opening: ${title}`, '🔍')}>
      <div className={`lc-img ${gradient}`}>
        {badge && <div className={`lc-badge ${badgeClass}`}>{badge}</div>}
        <button
          className="lc-save"
          onClick={e => { e.stopPropagation(); showToast('Added to saved!', '❤️') }}
        >
          🤍
        </button>
        {emoji}
      </div>

      <div className="lc-body">
        <div className="lc-title">{title}</div>
        <div className="lc-price-row">
          <div className="lc-price">{formatPriceFull(price)}</div>
          {originalPrice && <div className="lc-og">{formatPrice(originalPrice)}</div>}
        </div>
        <div className="lc-tags">
          {tags.map(tag => <span key={tag} className="lc-tag">{tag}</span>)}
        </div>
      </div>

      <div className="lc-footer">
        <div className="lc-av" style={{ background: seller.color }}>{seller.initials}</div>
        <div>
          <div className="lc-seller">
            {seller.name}
            {verified && <span className="lc-verify">✓</span>}
          </div>
          <div className="lc-loc">
            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z" />
            </svg>
            {location}
          </div>
        </div>
        <div className="lc-time">{time}</div>
      </div>
    </div>
  )
}
