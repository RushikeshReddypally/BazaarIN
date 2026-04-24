import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { formatPriceFull, formatPrice } from '../utils/format'
import { useFavourite } from '../hooks/useFavourite'
import { supabase } from '../lib/supabase'
import { categoryIcons } from '../data/categories.jsx'

const HeartIcon = ({ filled }) => (
  <svg width="18" height="18" fill={filled ? '#e8473f' : 'none'} stroke={filled ? '#e8473f' : 'currentColor'} strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
)
const ChatIcon = () => (
  <svg width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
)
const TrashIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
)
const TagIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="3" />
  </svg>
)
const ChevL = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
)
const ChevR = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
)
const PinIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z" /><circle cx="12" cy="9" r="2.5" />
  </svg>
)
const CalIcon = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
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

  // Re-fetch fresh data (picks up images uploaded after insert)
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
    ? Math.round((1 - price / original_price) * 100) : null
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
    if (error) { showToast('Failed to delete', '✕'); return }
    setActiveListing(null); bumpListings(); showToast('Listing deleted')
  }

  async function handleMarkSold() {
    const { error } = await supabase.from('listings')
      .update({ badge: 'Sold', badge_class: 'badge-sold' }).eq('id', listing.id)
    if (error) { showToast('Failed to update', '✕'); return }
    bumpListings(); setActiveListing(null); showToast('Marked as sold')
  }

  return (
    <div
      className="ldm-overlay"
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(10,10,20,0.72)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 16, overflowY: 'auto',
      }}
      onClick={e => e.target === e.currentTarget && setActiveListing(null)}
    >
      <div
        className="ldm-inner"
        style={{
          background: '#fff', borderRadius: 20,
          width: '100%', maxWidth: 920,
          display: 'flex', flexDirection: 'row',
          boxShadow: '0 40px 100px rgba(0,0,0,0.32)',
          overflow: 'hidden',
          animation: 'ldmIn 0.24s cubic-bezier(.34,1.4,.64,1)',
          maxHeight: '92vh',
          position: 'relative',
        }}
      >
        {/* ── LEFT: image gallery ── */}
        <div className="ldm-left" style={{
          width: '48%', flexShrink: 0, display: 'flex', flexDirection: 'column',
          background: '#f5f5f7',
        }}>
          {/* Main image */}
          <div className={gradient || 'li2'} style={{
            flex: 1, position: 'relative', overflow: 'hidden',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: 300,
          }}>
            {badge && (
              <span className={`lc-badge ${badge_class}`} style={{
                position: 'absolute', top: 14, left: 14, zIndex: 6,
                fontSize: 10, fontWeight: 800, padding: '4px 10px', letterSpacing: '.5px',
              }}>{badge}</span>
            )}

            {hasImages ? (
              <>
                <img
                  key={currentImg}
                  src={images[currentImg]}
                  alt={title}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {total > 1 && (
                  <>
                    <button onClick={prev} style={arrowStyle('left')}>
                      <ChevL />
                    </button>
                    <button onClick={next} style={arrowStyle('right')}>
                      <ChevR />
                    </button>
                    <div style={{
                      position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
                      display: 'flex', gap: 5, zIndex: 5,
                    }}>
                      {images.map((_, i) => (
                        <button key={i} onClick={() => setCurrentImg(i)} style={{
                          width: i === currentImg ? 20 : 7, height: 7, borderRadius: 99,
                          background: i === currentImg ? '#fff' : 'rgba(255,255,255,0.45)',
                          border: 'none', cursor: 'pointer', padding: 0,
                          transition: 'all 0.2s', boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
                        }} />
                      ))}
                    </div>
                    <div style={{
                      position: 'absolute', top: 14, right: 14,
                      background: 'rgba(0,0,0,0.52)', color: '#fff',
                      fontSize: 11, fontWeight: 600, padding: '3px 9px', borderRadius: 99, zIndex: 5,
                    }}>{currentImg + 1} / {total}</div>
                  </>
                )}
              </>
            ) : (
              <div style={{ color: 'rgba(0,0,0,0.18)', transform: 'scale(3)', display: 'flex' }}>
                {catIcon}
              </div>
            )}
          </div>

          {/* Thumbnail row */}
          {total > 1 && (
            <div style={{
              display: 'flex', gap: 6, padding: '8px 10px',
              background: '#efefef', overflowX: 'auto', flexShrink: 0,
              scrollbarWidth: 'none',
            }}>
              {images.map((src, i) => (
                <button key={i} onClick={() => setCurrentImg(i)} style={{
                  width: 54, height: 54, flexShrink: 0, borderRadius: 8, padding: 0,
                  overflow: 'hidden', cursor: 'pointer',
                  border: `2.5px solid ${i === currentImg ? '#1d3a6e' : 'transparent'}`,
                  opacity: i === currentImg ? 1 : 0.55, transition: 'all 0.15s',
                }}>
                  <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </button>
              ))}
            </div>
          )}

          {/* Category badge */}
          <div style={{
            padding: '10px 14px', background: '#f9fafb',
            borderTop: '1px solid rgba(0,0,0,0.06)', flexShrink: 0,
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 99,
              background: '#eef2ff', fontSize: 12, fontWeight: 700, color: '#1d3a6e',
              textTransform: 'capitalize',
            }}>
              <span style={{ display: 'flex' }}>{catIcon}</span>
              {category}
            </span>
          </div>
        </div>

        {/* ── RIGHT: details ── */}
        <div
          className="ldm-right"
          style={{
            flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column',
            borderRadius: '0 20px 20px 0',
          }}
        >
          {/* Sticky header */}
          <div style={{
            padding: '20px 24px 0', position: 'sticky', top: 0,
            background: '#fff', zIndex: 10,
            borderBottom: '1px solid #f3f4f6', paddingBottom: 16,
          }}>
            {/* Close + location row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>
                <PinIcon />
                {location || '—'}
                {postedDate && <span style={{ color: '#d1d5db' }}>·</span>}
                {postedDate && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CalIcon />{postedDate}</span>}
              </div>
              <button onClick={() => setActiveListing(null)} style={{
                width: 30, height: 30, borderRadius: '50%', border: '1.5px solid #e5e7eb',
                background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#6b7280', fontSize: 13, flexShrink: 0,
              }}>✕</button>
            </div>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 30, fontWeight: 900, color: '#1a1a2e', letterSpacing: '-1px', lineHeight: 1 }}>
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
                }}>{discount}% OFF</span>
              )}
            </div>

            {/* Title */}
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.35, margin: '8px 0 0', letterSpacing: '-0.2px' }}>
              {title}
            </h2>
          </div>

          {/* Scrollable body */}
          <div style={{ padding: '16px 24px 28px', display: 'flex', flexDirection: 'column', gap: 18, flex: 1 }}>

            {/* Tags / specs */}
            {tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {tags.map(t => (
                  <span key={t} style={{
                    padding: '5px 12px', borderRadius: 99,
                    background: '#f3f4f6', fontSize: 12, fontWeight: 600, color: '#374151',
                    border: '1px solid #e5e7eb',
                  }}>{t}</span>
                ))}
              </div>
            )}

            {/* CTA */}
            <div style={{ display: 'flex', gap: 8 }}>
              {isOwner ? (
                <>
                  <button onClick={handleMarkSold} style={{
                    flex: 1, padding: '13px', borderRadius: 12,
                    background: '#1d3a6e', color: '#fff',
                    fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  }}>
                    <TagIcon /> Mark as Sold
                  </button>
                  <button onClick={handleDelete} disabled={deleting} style={{
                    padding: '13px 18px', borderRadius: 12,
                    background: '#fef2f2', color: '#dc2626',
                    border: '1.5px solid #fca5a5', cursor: 'pointer',
                    fontSize: 14, fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <TrashIcon /> {deleting ? '…' : 'Delete'}
                  </button>
                </>
              ) : (
                <>
                  <button onClick={handleContact} style={{
                    flex: 1, padding: '13px', borderRadius: 12,
                    background: '#1d3a6e', color: '#fff',
                    fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#22223b'}
                    onMouseLeave={e => e.currentTarget.style.background = '#1d3a6e'}
                  >
                    <ChatIcon /> Contact Seller
                  </button>
                  <button onClick={handleSave} style={{
                    padding: '13px 16px', borderRadius: 12,
                    border: `1.5px solid ${saved ? '#fca5a5' : '#e5e7eb'}`,
                    background: saved ? '#fff5f5' : '#fff',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#fca5a5'; e.currentTarget.style.background = '#fff5f5' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = saved ? '#fca5a5' : '#e5e7eb'; e.currentTarget.style.background = saved ? '#fff5f5' : '#fff' }}
                  >
                    <HeartIcon filled={saved} />
                  </button>
                </>
              )}
            </div>

            {/* Seller card — buyers only */}
            {!isOwner && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 16px', borderRadius: 14,
                background: '#f9fafb', border: '1px solid #ececec',
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: seller_color || '#4a4e69', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 800, color: '#fff',
                }}>
                  {seller_initials}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {seller_name}
                    {verified && (
                      <span style={{
                        background: '#1d3a6e', color: '#fff', borderRadius: '50%',
                        width: 16, height: 16, fontSize: 8, fontWeight: 900,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      }}>✓</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Member · BazaarTrade</div>
                </div>
              </div>
            )}

            {/* Description */}
            {description && (
              <div>
                <div style={{
                  fontSize: 11, fontWeight: 700, color: '#9ca3af',
                  textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8,
                }}>Description</div>
                <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, whiteSpace: 'pre-line', margin: 0 }}>
                  {description}
                </p>
              </div>
            )}

            {/* Safety tip */}
            <div style={{
              padding: '11px 14px', borderRadius: 10,
              background: '#fffbeb', border: '1px solid #fde68a',
              fontSize: 12, color: '#92400e',
              display: 'flex', gap: 8, alignItems: 'flex-start',
            }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3" />
              </svg>
              Never pay in advance. Meet in person to inspect before buying.
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes ldmIn { from { transform: translateY(28px) scale(0.96); opacity: 0 } to { transform: none; opacity: 1 } }
        .ldm-right::-webkit-scrollbar { width: 5px }
        .ldm-right::-webkit-scrollbar-track { background: transparent }
        .ldm-right::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 99px }
        @media(max-width:640px){
          .ldm-inner { flex-direction: column !important; max-height: 95vh !important; border-radius: 20px 20px 0 0 !important; }
          .ldm-left { width: 100% !important; }
          .ldm-right { border-radius: 0 !important; }
        }
      `}</style>
    </div>
  )
}

function arrowStyle(side) {
  return {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    [side]: 10, zIndex: 5,
    width: 36, height: 36, borderRadius: '50%',
    background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  }
}
