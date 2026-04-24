import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { formatPriceFull, formatPrice } from '../utils/format'
import { useFavourite } from '../hooks/useFavourite'
import { supabase } from '../lib/supabase'

function InfoRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
      <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
        <div style={{ fontSize: 13.5, color: '#1a1a2e', fontWeight: 500, marginTop: 1 }}>{value}</div>
      </div>
    </div>
  )
}

export default function ListingDetailModal() {
  const { activeListing, setActiveListing, user, setLoginOpen, showToast, setChatListing, setPendingAction } = useApp()
  const { saved, toggle: toggleFav } = useFavourite(activeListing?.id, user)
  const [currentImg, setCurrentImg] = useState(0)
  const [listing, setListing] = useState(null)
  const open = !!activeListing

  // Sync base listing from context
  useEffect(() => {
    if (activeListing) {
      setListing(activeListing)
      setCurrentImg(0)
    } else {
      setListing(null)
    }
  }, [activeListing?.id])

  // Re-fetch to get latest images (e.g. uploaded just after insert)
  useEffect(() => {
    if (!activeListing?.id) return
    supabase.from('listings').select('*').eq('id', activeListing.id).single()
      .then(({ data }) => { if (data) setListing(data) })
  }, [activeListing?.id])

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') setActiveListing(null) }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, setActiveListing])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!activeListing || !listing) return null

  const {
    title, price, original_price, emoji, gradient,
    badge, badge_class, location, tags, description,
    seller_name, seller_initials, seller_color, verified,
    category, created_at, images,
  } = listing

  const hasImages = images?.length > 0
  const total = images?.length ?? 0

  const discount = original_price && price
    ? Math.round((1 - price / original_price) * 100)
    : null

  const postedDate = created_at
    ? new Date(created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  function prev() { setCurrentImg(i => (i - 1 + total) % total) }
  function next() { setCurrentImg(i => (i + 1) % total) }

  function handleContact() {
    if (!user) {
      setPendingAction(() => () => setChatListing(activeListing))
      setLoginOpen(true)
      return
    }
    setChatListing(activeListing)
  }

  async function handleSave() {
    if (!user) {
      setPendingAction(() => () => toggleFav())
      setLoginOpen(true)
      return
    }
    const nowSaved = await toggleFav()
    showToast(nowSaved ? 'Saved to wishlist!' : 'Removed from wishlist', nowSaved ? '❤️' : '🤍')
  }

  const arrowBtn = {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    width: 34, height: 34, borderRadius: '50%',
    background: 'rgba(255,255,255,0.88)', border: '1px solid rgba(0,0,0,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', fontSize: 18, fontWeight: 700, color: '#1a1a2e',
    boxShadow: '0 2px 8px rgba(0,0,0,0.14)', zIndex: 5,
    transition: 'background 0.15s',
  }

  return (
    <div
      className="ldm-overlay"
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(22,22,40,0.62)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        animation: 'fadeIn 0.18s ease',
      }}
      onClick={e => e.target === e.currentTarget && setActiveListing(null)}
    >
      <div className="ldm-inner" style={{
        background: '#fff',
        borderRadius: 24,
        width: '100%',
        maxWidth: 860,
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
        animation: 'slideUp 0.22s cubic-bezier(.34,1.56,.64,1)',
        position: 'relative',
      }}>
        {/* Close */}
        <button
          onClick={() => setActiveListing(null)}
          style={{
            position: 'absolute', top: 16, right: 16, zIndex: 10,
            width: 34, height: 34, borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)', border: '1px solid #e5e7eb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 16, color: '#6b7280',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >✕</button>

        {/* Left — image area */}
        <div className="ldm-left" style={{
          width: '42%', flexShrink: 0,
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Main image with carousel */}
          <div className={`lc-img ${gradient || 'li1'}`} style={{
            flex: 1, minHeight: 280, borderRadius: 0,
            fontSize: 96, position: 'relative',
          }}>
            {badge && (
              <div className={`lc-badge ${badge_class}`} style={{ fontSize: 11, padding: '5px 12px' }}>
                {badge}
              </div>
            )}

            {hasImages ? (
              <>
                <img
                  key={currentImg}
                  src={images[currentImg]}
                  alt={title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }}
                />
                {total > 1 && (
                  <>
                    <button
                      onClick={prev}
                      style={{ ...arrowBtn, left: 10 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fff'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.88)'}
                    >‹</button>
                    <button
                      onClick={next}
                      style={{ ...arrowBtn, right: 10 }}
                      onMouseEnter={e => e.currentTarget.style.background = '#fff'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.88)'}
                    >›</button>
                    {/* Dot indicators */}
                    <div style={{
                      position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
                      display: 'flex', gap: 5, zIndex: 4,
                    }}>
                      {images.map((_, i) => (
                        <div
                          key={i}
                          onClick={() => setCurrentImg(i)}
                          style={{
                            width: i === currentImg ? 18 : 6,
                            height: 6, borderRadius: 99,
                            background: i === currentImg ? '#fff' : 'rgba(255,255,255,0.55)',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                          }}
                        />
                      ))}
                    </div>
                    {/* Counter */}
                    <div style={{
                      position: 'absolute', top: 10, right: 10,
                      background: 'rgba(0,0,0,0.45)', color: '#fff',
                      fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 99,
                      zIndex: 4,
                    }}>
                      {currentImg + 1} / {total}
                    </div>
                  </>
                )}
              </>
            ) : (
              <span>{emoji}</span>
            )}
          </div>

          {/* Thumbnail strip — clickable */}
          {total > 1 && (
            <div style={{
              display: 'flex', gap: 6, padding: '10px 12px',
              overflowX: 'auto', background: '#fafafa',
              scrollbarWidth: 'none',
            }}>
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  onClick={() => setCurrentImg(i)}
                  style={{
                    width: 56, height: 56, objectFit: 'cover',
                    borderRadius: 8, flexShrink: 0, cursor: 'pointer',
                    border: `2px solid ${i === currentImg ? '#1d3a6e' : '#e5e7eb'}`,
                    opacity: i === currentImg ? 1 : 0.65,
                    transition: 'all 0.15s ease',
                  }}
                />
              ))}
            </div>
          )}

          {/* Category pill */}
          <div style={{ padding: '12px 16px', background: '#fafafa', borderTop: '1px solid #f3f4f6' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 99, background: '#f0f4ff',
              fontSize: 12, fontWeight: 600, color: '#1d3a6e', textTransform: 'capitalize',
            }}>
              {emoji} {category}
            </span>
          </div>
        </div>

        {/* Right — details */}
        <div className="ldm-right" style={{ flex: 1, overflowY: 'auto', padding: '28px 28px 24px' }}>
          {/* Title */}
          <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', lineHeight: 1.25, marginBottom: 12 }}>
            {title}
          </h2>

          {/* Price row */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 30, fontWeight: 900, color: '#1a1a2e', letterSpacing: '-1px' }}>
              {formatPriceFull(price)}
            </span>
            {original_price && (
              <span style={{ fontSize: 16, color: '#9ca3af', textDecoration: 'line-through' }}>
                {formatPrice(original_price)}
              </span>
            )}
            {discount && (
              <span style={{
                fontSize: 12, fontWeight: 700, color: '#16a34a',
                background: '#dcfce7', padding: '3px 8px', borderRadius: 99,
              }}>
                {discount}% OFF
              </span>
            )}
          </div>

          {/* Tags */}
          {tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
              {tags.map(t => (
                <span key={t} style={{
                  padding: '4px 10px', borderRadius: 99,
                  background: '#f3f4f6', fontSize: 12, fontWeight: 500, color: '#6b7280',
                }}>
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
            <button
              onClick={handleContact}
              style={{
                flex: 1, padding: '13px', borderRadius: 12,
                background: '#1d3a6e', color: '#fff',
                fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#22223b'}
              onMouseLeave={e => e.currentTarget.style.background = '#1d3a6e'}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Contact Seller
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '13px 18px', borderRadius: 12,
                border: '1.5px solid #e5e7eb', background: '#fff',
                fontSize: 18, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.background = '#fff5f5' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = '#fff' }}
              title={saved ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              {saved ? '❤️' : '🤍'}
            </button>
          </div>

          {/* Info rows */}
          <div style={{ marginBottom: 20 }}>
            <InfoRow icon="📍" label="Location" value={location || '—'} />
            {postedDate && <InfoRow icon="🗓️" label="Posted on" value={postedDate} />}
          </div>

          {/* Description */}
          {description && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Description
              </div>
              <p style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                {description}
              </p>
            </div>
          )}

          {/* Seller card */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '14px 16px', borderRadius: 12,
            background: '#f9fafb', border: '1px solid #f3f4f6',
            marginTop: 4,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: seller_color || '#4a4e69',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800, color: '#fff', flexShrink: 0,
            }}>
              {seller_initials}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: 5 }}>
                {seller_name}
                {verified && (
                  <span style={{
                    width: 16, height: 16, borderRadius: '50%',
                    background: '#1d3a6e', color: '#fff',
                    fontSize: 9, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800,
                  }}>✓</span>
                )}
              </div>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Seller</div>
            </div>
            <button
              onClick={handleContact}
              style={{
                padding: '8px 16px', borderRadius: 8,
                background: '#f0f4ff', color: '#1d3a6e',
                fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer',
              }}
            >
              Message
            </button>
          </div>

          {/* Safety tip */}
          <div style={{
            marginTop: 16, padding: '10px 14px', borderRadius: 10,
            background: '#fffbeb', border: '1px solid #fde68a',
            fontSize: 12, color: '#92400e', display: 'flex', gap: 8, alignItems: 'flex-start',
          }}>
            <span style={{ flexShrink: 0 }}>⚠️</span>
            <span>Never pay in advance. Meet in person to inspect before buying.</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { transform: translateY(20px) scale(0.97); opacity: 0 } to { transform: none; opacity: 1 } }
      `}</style>
    </div>
  )
}
