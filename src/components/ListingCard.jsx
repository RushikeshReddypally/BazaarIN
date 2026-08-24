import { useApp } from '../context/AppContext'
import { formatPriceFull, formatTimeAgo } from '../utils/format'
import { useFavourite } from '../hooks/useFavourite'
import { categoryIcons } from '../data/categories.jsx'
import HeartIcon from './icons/HeartIcon'
import ImageIcon from './icons/ImageIcon'

export default function ListingCard({ listing }) {
  const { showToast, setActiveListing, user, setLoginOpen } = useApp()
  const { saved, toggle } = useFavourite(listing.id, user)
  const {
    title, price, original_price, category, gradient,
    badge, badge_class, location,
    created_at, images,
  } = listing

  const thumb = images?.[0] ?? null
  const CatIcon = categoryIcons[category] ?? categoryIcons['all']

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
          <HeartIcon size={14} filled={saved} />
        </button>
        {thumb
          ? <img src={thumb} alt={title} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} />
          : <span style={{ color: 'rgba(0,0,0,0.3)', display: 'flex' }}><CatIcon /></span>
        }
        {images?.length > 1 && (
          <div style={{
            position: 'absolute', bottom: 7, left: 7, zIndex: 3,
            background: 'rgba(0,0,0,0.52)', color: '#fff',
            fontSize: 10, fontWeight: 600, padding: '3px 7px', borderRadius: 5,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <ImageIcon size={10} />
            {images.length}
          </div>
        )}
      </div>

      <div className="lc-body">
        <div className="lc-price-row">
          <div className="lc-price">{formatPriceFull(price)}</div>
          {original_price && <div className="lc-og">{formatPriceFull(original_price)}</div>}
        </div>
        <div className="lc-title">{title}</div>
        <div className="lc-meta">
          <span className="lc-loc">{location}</span>
          <span className="lc-time">{formatTimeAgo(created_at)}</span>
        </div>
      </div>
    </div>
  )
}
