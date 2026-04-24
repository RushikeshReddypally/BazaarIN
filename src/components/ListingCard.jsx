import { useApp } from '../context/AppContext'
import { formatPriceFull, formatPrice } from '../utils/format'
import { useFavourite } from '../hooks/useFavourite'
import { categoryIcons } from '../data/categories.jsx'

const HeartIcon = ({ filled }) => (
  <svg width="14" height="14" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)

export default function ListingCard({ listing }) {
  const { showToast, setActiveListing, user, setLoginOpen } = useApp()
  const { saved, toggle } = useFavourite(listing.id, user)
  const {
    title, price, original_price, category, gradient,
    badge, badge_class, location, tags,
    seller_name, seller_initials, seller_color, verified,
    images,
  } = listing

  const thumb = images?.[0] ?? null
  const catIcon = categoryIcons[category] ?? categoryIcons['all']

  async function handleSave(e) {
    e.stopPropagation()
    if (!user) { setLoginOpen(true); return }
    const nowSaved = await toggle()
    showToast(nowSaved ? 'Saved to wishlist!' : 'Removed from wishlist', nowSaved ? '❤️' : '🤍')
  }

  return (
    <div className="lc" onClick={() => setActiveListing(listing)} style={{ cursor: 'pointer' }}>
      <div className={`lc-img ${gradient}`} style={{ overflow: 'hidden', position: 'relative' }}>
        {badge && <div className={`lc-badge ${badge_class}`}>{badge}</div>}
        <button
          className="lc-save"
          onClick={handleSave}
          title={saved ? 'Remove from wishlist' : 'Save'}
          style={{ color: saved ? '#e8473f' : 'rgba(0,0,0,0.45)' }}
        >
          <HeartIcon filled={saved} />
        </button>
        {thumb
          ? <img src={thumb} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          : <span style={{ color: 'rgba(0,0,0,0.3)', display: 'flex' }}>{catIcon}</span>
        }
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
