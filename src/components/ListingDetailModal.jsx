import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { formatPriceFull, formatPrice } from '../utils/format'
import { useFavourite } from '../hooks/useFavourite'
import { supabase } from '../lib/supabase'
import { categoryIcons } from '../data/categories.jsx'

const PinIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z" />
    <circle cx="12" cy="9" r="2.5" />
  </svg>
)
const CalIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
)
const ChatIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)
const HeartIcon = ({ filled }) => (
  <svg width="17" height="17" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)
const TrashIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
)
const TagIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="3" />
  </svg>
)
const VerifiedIcon = () => (
  <svg width="14" height="14" fill="#1d3a6e" viewBox="0 0 24 24">
    <path d="M12 2l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 14.4l-4.8 2.5.9-5.4L4.2 7.7l5.4-.8z" />
    <polyline stroke="#fff" strokeWidth="1.5" fill="none" points="9 12 11 14 15 10" />
  </svg>
)

export default function ListingDetailModal() {
  const {
    activeListing, setActiveListing,
    user, setLoginOpen, showToast,
    setChatListing, setPendingAction, bumpListings,
  } = useApp()
  const { saved, toggle: toggleFav } = useFavourite(activeListing?.id, user)
  const [currentImg, setCurrentImg] = useState(0)
  const [listing, setListing] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const open = !!activeListing

  useEffect(() => {
    if (activeListing) { setListing(activeListing); setCurrentImg(0) }
    else setListing(null)
  }, [activeListing?.id])

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
    title, price, original_price, gradient,
    badge, badge_class, location, tags, description,
    seller_name, seller_initials, seller_color, verified,
    category, created_at, images, user_id,
  } = listing

  const isOwner = !!(user?.id && user_id && user.id === user_id)
  const hasImages = images?.length > 0
  const total = images?.length ?? 0
  const catIcon = categoryIcons[category] ?? categoryIcons['all']

  const discount = original_price && price && original_price > price
    ? Math.round((1 - price / original_price) * 100)
    : null

  const postedDate = created_at
    ? new Date(created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  function prev() { setCurrentImg(i => (i - 1 + total) % total) }
  function next() { setCurrentImg(i => (i + 1) % total) }

  function handleContact() {
    if (!user) { setPendingAction(() => () => setChatListing(activeListing)); setLoginOpen(true); return }
    setChatListing(activeListing)
  }

  async function handleSave() {
    if (!user) { setPendingAction(() => () => toggleFav()); setLoginOpen(true); return }
    const nowSaved = await toggleFav()
    showToast(nowSaved ? 'Saved to wishlist!' : 'Removed from wishlist')
  }

  async function handleDelete() {
    if (!window.confirm('Delete this listing? This cannot be undone.')) return
    setDeleting(true)
    const { error } = await supabase.from('listings').delete().eq('id', listing.id)
    setDeleting(false)
    if (error) { showToast('Failed to delete listing', '✕'); return }
    setActiveListing(null)
    bumpListings()
    showToast('Listing deleted', '✓')
  }

  async function handleMarkSold() {
    const { error } = await supabase.from('listings')
      .update({ badge: 'Sold', badge_class: 'badge-sold' })
      .eq('id', listing.id)
    if (error) { showToast('Failed to update listing', '✕'); return }
    bumpListings()
    setActiveListing(null)
    showToast('Marked as sold', '✓')
  }

  const arrowBtn = {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    width: 36, height: 36, borderRadius: '50%',
    background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(0,0,0,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#1a1a2e',
    boxShadow: '0 2px 8px rgba(0,0,0,0.14)', zIndex: 5,
  }

  return (
    <div
      className="ldm-overlay"
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(15,15,30,0.65)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16,
      }}
      onClick={e => e.target === e.currentTarget && setActiveListing(null)}
    >
      <div
        className="ldm-inner"
        style={{
          background: '#fff', borderRadius: 20,
          width: '100%', maxWidth: 900,
          height: 'min(92vh, 640px)',
          display: 'flex', flexDirection: 'row',
          boxShadow: '0 32px 80px rgba(0,0,0,0.28)',
          overflow: 'hidden',
          animation: 'slideUp 0.22s cubic-bezier(.34,1.56,.64,1)',
          position: 'relative',
        }}
      >
        {/* Close */}
        <button
          onClick={() => setActiveListing(null)}
          style={{
            position: 'absolute', top: 14, right: 14, zIndex: 20,
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(255,255,255,0.95)', border: '1px solid #e5e7eb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: 14, color: '#6b7280',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          }}
        >✕</button>

        {/* LEFT — image panel */}
        <div
          className="ldm-left"
          style={{
            width: '44%', flexShrink: 0,
            display: 'flex', flexDirection: 'column',
            background: '#f9fafb',
          }}
        >
          {/* Main image */}
          <div
            className={`${gradient || 'li1'}`}
            style={{
              flex: 1, position: 'relative', overflow: 'hidden',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {badge && (
              <div className={`lc-badge ${badge_class}`} style={{ position: 'absolute', top: 12, left: 12, zIndex: 5, fontSize: 10, padding: '4px 10px' }}>
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
                    <button onClick={prev} style={{ ...arrowBtn, left: 10 }}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button onClick={next} style={{ ...arrowBtn, right: 10 }}>
                      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                    <div style={{
                      position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
                      display: 'flex', gap: 5, zIndex: 4,
                    }}>
                      {images.map((_, i) => (
                        <div key={i} onClick={() => setCurrentImg(i)} style={{
                          width: i === currentImg ? 18 : 6, height: 6, borderRadius: 99,
                          background: i === currentImg ? '#fff' : 'rgba(255,255,255,0.5)',
                          cursor: 'pointer', transition: 'all 0.2s',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                        }} />
                      ))}
                    </div>
                    <div style={{
                      position: 'absolute', top: 12, right: 12,
                      background: 'rgba(0,0,0,0.5)', color: '#fff',
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, zIndex: 4,
                    }}>
                      {currentImg + 1}/{total}
                    </div>
                  </>
                )}
              </>
            ) : (
              <span style={{ color: 'rgba(0,0,0,0.22)', transform: 'scale(2.5)' }}>{catIcon}</span>
            )}
          </div>

          {/* Thumbnail strip */}
          {total > 1 && (
            <div style={{
              display: 'flex', gap: 6, padding: '8px 10px',
              overflowX: 'auto', background: '#f3f4f6',
              scrollbarWidth: 'none', flexShrink: 0,
            }}>
              {images.map((img, i) => (
                <img key={i} src={img} alt="" onClick={() => setCurrentImg(i)} style={{
                  width: 52, height: 52, objectFit: 'cover', borderRadius: 8,
                  flexShrink: 0, cursor: 'pointer',
                  border: `2px solid ${i === currentImg ? '#1d3a6e' : 'transparent'}`,
                  opacity: i === currentImg ? 1 : 0.6,
                  transition: 'all 0.15s',
                }} />
              ))}
            </div>
          )}

          {/* Category */}
          <div style={{
            padding: '10px 14px', background: '#f9fafb',
            borderTop: '1px solid #f0f0f0', flexShrink: 0,
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 99, background: '#eef2ff',
              fontSize: 12, fontWeight: 600, color: '#1d3a6e', textTransform: 'capitalize',
            }}>
              <span style={{ display: 'flex' }}>{catIcon}</span>
              {category}
            </span>
          </div>
        </div>

        {/* RIGHT — details (scrollable, clipped by border-radius of outer) */}
        <div
          className="ldm-right"
          style={{
            flex: 1, overflowY: 'auto', padding: '28px 26px 24px',
            display: 'flex', flexDirection: 'column', gap: 0,
          }}
        >
          {/* Title */}
          <h2 style={{ fontSize: 21, fontWeight: 800, color: '#1a1a2e', lineHeight: 1.3, marginBottom: 10 }}>
            {title}
          </h2>

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 28, fontWeight: 900, color: '#1a1a2e', letterSpacing: '-0.5px' }}>
              {formatPriceFull(price)}
            </span>
            {original_price && original_price > price && (
              <span style={{ fontSize: 15, color: '#9ca3af', textDecoration: 'line-through' }}>
                {formatPrice(original_price)}
              </span>
            )}
            {discount > 0 && (
              <span style={{
                fontSize: 11, fontWeight: 700, color: '#16a34a',
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
                  background: '#f3f4f6', fontSize: 12, fontWeight: 500, color: '#374151',
                }}>
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {isOwner ? (
              <>
                <button
                  onClick={handleMarkSold}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 10,
                    background: '#1d3a6e', color: '#fff',
                    fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <TagIcon /> Mark as Sold
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    padding: '12px 16px', borderRadius: 10,
                    background: '#fef2f2', color: '#dc2626',
                    fontSize: 13, fontWeight: 700,
                    border: '1.5px solid #fca5a5', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <TrashIcon /> {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleContact}
                  style={{
                    flex: 1, padding: '12px', borderRadius: 10,
                    background: '#1d3a6e', color: '#fff',
                    fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#22223b'}
                  onMouseLeave={e => e.currentTarget.style.background = '#1d3a6e'}
                >
                  <ChatIcon /> Contact Seller
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    padding: '12px 16px', borderRadius: 10,
                    border: '1.5px solid #e5e7eb', background: '#fff',
                    cursor: 'pointer', color: saved ? '#e8473f' : '#9ca3af',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                  title={saved ? 'Remove from wishlist' : 'Save'}
                >
                  <HeartIcon filled={saved} />
                </button>
              </>
            )}
          </div>

          {/* Info rows */}
          <div style={{ borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', color: '#374151', fontSize: 13 }}>
              <span style={{ color: '#6b7280', display: 'flex' }}><PinIcon /></span>
              <span style={{ color: '#9ca3af', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', width: 70 }}>Location</span>
              <span style={{ fontWeight: 500 }}>{location || '—'}</span>
            </div>
            {postedDate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0', borderTop: '1px solid #f3f4f6', color: '#374151', fontSize: 13 }}>
                <span style={{ color: '#6b7280', display: 'flex' }}><CalIcon /></span>
                <span style={{ color: '#9ca3af', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', width: 70 }}>Posted</span>
                <span style={{ fontWeight: 500 }}>{postedDate}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {description && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
                Description
              </div>
              <p style={{ fontSize: 13.5, color: '#4b5563', lineHeight: 1.75, whiteSpace: 'pre-line', margin: 0 }}>
                {description}
              </p>
            </div>
          )}

          {/* Seller card — only for non-owner */}
          {!isOwner && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '14px 16px', borderRadius: 12,
              background: '#f9fafb', border: '1px solid #f0f0f0',
              marginBottom: 14,
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: seller_color || '#4a4e69',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color: '#fff', flexShrink: 0,
              }}>
                {seller_initials}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {seller_name}
                  {verified && <VerifiedIcon />}
                </div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Seller</div>
              </div>
            </div>
          )}

          {/* Safety tip */}
          <div style={{
            padding: '10px 14px', borderRadius: 10,
            background: '#fffbeb', border: '1px solid #fde68a',
            fontSize: 12, color: '#92400e',
            display: 'flex', gap: 8, alignItems: 'flex-start',
          }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3" />
            </svg>
            <span>Never pay in advance. Meet in person to inspect before buying.</span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { transform: translateY(24px) scale(0.97); opacity: 0 } to { transform: none; opacity: 1 } }
      `}</style>
    </div>
  )
}
