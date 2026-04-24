import { useApp } from '../context/AppContext'
import { formatPriceFull, formatPrice } from '../utils/format'
import { useFavourite } from '../hooks/useFavourite'

export default function ListingCard({ listing }) {
  const { showToast, setActiveListing, user, setLoginOpen } = useApp()
  const { saved, toggle } = useFavourite(listing.id, user)
  const {
    title, price, original_price, emoji, gradient,
    badge, badge_class, location, tags,
    seller_name, seller_initials, seller_color, verified,
  } = listing

  async function handleSave(e) {
    e.stopPropagation()
    if (!user) { setLoginOpen(true); return }
    const nowSaved = await toggle()
    showToast(nowSaved ? 'Saved to wishlist!' : 'Removed from wishlist', nowSaved ? '❤️' : '🤍')
  }

  return (
    <div className="lc" onClick={() => setActiveListing(listing)} style={{ cursor: 'pointer' }}>
      <div className={`lc-img ${gradient}`}>
        {badge && <div className={`lc-badge ${badge_class}`}>{badge}</div>}
        <button className="lc-save" onClick={handleSave} title={saved ? 'Remove from wishlist' : 'Save'}>
          {saved ? '❤️' : '🤍'}
        </button>
        {emoji}
      </div>

      <div className="lc-body">
        <div className="lc-title">{title}</div>
        <div className="lc-price-row">
          <div className="lc-price">{formatPriceFull(price)}</div>
          {original_price && <div className="lc-og">{formatPrice(original_price)}</div>}
        </div>
        <div className="lc-tags">
          {(tags ?? []).map(tag => <span key={tag} className="lc-tag">{tag}</span>)}
        </div>
      </div>

      <div className="lc-footer">
        <div className="lc-av" style={{ background: seller_color }}>{seller_initials}</div>
        <div>
          <div className="lc-seller">
            {seller_name}
            {verified && <span className="lc-verify">✓</span>}
          </div>
          <div className="lc-loc">
            <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z" />
            </svg>
            {location}
          </div>
        </div>
      </div>
    </div>
  )
}
