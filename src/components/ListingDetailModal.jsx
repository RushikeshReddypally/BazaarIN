import { useEffect, useState } from 'react'
import { useApp } from '../context/AppContext'
import { formatPriceFull, formatPrice } from '../utils/format'
import { useFavourite } from '../hooks/useFavourite'
import { useVerification } from '../hooks/useVerification'
import { supabase } from '../lib/supabase'
import { categoryIcons, categories } from '../data/categories.jsx'
import { useSEO } from '../hooks/useSEO'
import { buildListingPath, CAT_TO_SLUG, cityToSlug } from '../utils/routing'

const ChevL = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6" /></svg>
)
const ChevR = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M9 18l6-6-6-6" /></svg>
)
const HeartIcon = ({ filled }) => (
  <svg width="16" height="16" fill={filled ? '#e8473f' : 'none'} stroke={filled ? '#e8473f' : 'currentColor'} strokeWidth="2.2" viewBox="0 0 24 24">
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
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2" />
  </svg>
)
const TagIcon = () => (
  <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="3" />
  </svg>
)
const PinIcon = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z" /><circle cx="12" cy="9" r="2.5" />
  </svg>
)
const CalIcon = () => (
  <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
)

export default function ListingDetailModal() {
  const {
    activeListing, setActiveListing,
    user, setLoginOpen, showToast,
    setChatListing, setPendingAction, bumpListings,
    addToCart, removeFromCart, cart, setCartOpen,
    setActiveCategory, setActiveLocation,
  } = useApp()
  const { saved, toggle: toggleFav } = useFavourite(activeListing?.id, user)
  const [currentImg, setCurrentImg] = useState(0)
  const [listing, setListing] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [similar, setSimilar] = useState([])
  const { isVerified: sellerVerified } = useVerification(listing?.user_id ? { id: listing.user_id } : null)
  const open = !!activeListing

  // Dynamic SEO when a listing is open
  const catSlug = listing ? CAT_TO_SLUG[listing.category] : null
  const catLabel = listing ? (categories.find(c => c.id === listing.category)?.label || listing.category) : null
  useSEO(listing ? {
    title: listing.title,
    description: listing.description
      ? listing.description.slice(0, 160)
      : `${listing.title} for ₹${listing.price?.toLocaleString('en-IN')} in ${listing.location} — BazaarTrade.in`,
    image: listing.images?.[0],
    url: buildListingPath(listing),
    type: 'og:product',
    listing,
    breadcrumbs: [
      { name: 'Home', url: '/' },
      { name: catLabel, url: catSlug ? `/${catSlug}` : undefined },
      ...(listing.location ? [{ name: listing.location, url: catSlug ? `/${catSlug}/${cityToSlug(listing.location)}` : undefined }] : []),
      { name: listing.title },
    ],
  } : {})

  useEffect(() => {
    if (activeListing) { setListing(activeListing); setCurrentImg(0); setSimilar([]) }
    else setListing(null)
  }, [activeListing?.id])

  // Fresh fetch to pick up latest images/status
  useEffect(() => {
    if (!activeListing?.id) return
    supabase.from('listings').select('*').eq('id', activeListing.id).single()
      .then(({ data }) => { if (data) setListing(data) })
  }, [activeListing?.id])

  // Fetch similar listings (same category, exclude current)
  useEffect(() => {
    if (!activeListing?.id || !activeListing?.category) return
    supabase
      .from('listings')
      .select('*')
      .eq('category', activeListing.category)
      .neq('id', activeListing.id)
      .order('created_at', { ascending: false })
      .limit(8)
      .then(({ data }) => {
        if (data) {
          const now = Date.now()
          const LIMIT = 48 * 3600 * 1000
          setSimilar(data.filter(l =>
            l.badge !== 'Sold' || !l.sold_at || (now - new Date(l.sold_at).getTime()) < LIMIT
          ))
        }
      })
  }, [activeListing?.id, activeListing?.category])

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
    seller_name, seller_initials, seller_color,
    category, created_at, images, user_id,
  } = listing

  const isOwner = !!(user?.id && user_id && user.id === user_id)
  const isSold = badge === 'Sold'
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
      .update({ badge: 'Sold', badge_class: 'badge-sold', sold_at: new Date().toISOString() })
      .eq('id', listing.id)
    if (error) { showToast('Failed to update', '✕'); return }
    setListing(l => ({ ...l, badge: 'Sold', badge_class: 'badge-sold', sold_at: new Date().toISOString() }))
    bumpListings()
    showToast('Marked as Sold — listing removes in 48 hrs. Unmark to keep it.', '✓')
  }

  async function handleUnmarkSold() {
    const { error } = await supabase.from('listings')
      .update({ badge: null, badge_class: null, sold_at: null })
      .eq('id', listing.id)
    if (error) { showToast('Failed to update', '✕'); return }
    setListing(l => ({ ...l, badge: null, badge_class: null, sold_at: null }))
    bumpListings()
    showToast('Listing is active again', '✓')
  }

  return (
    <div style={{
      position: 'fixed', top: 62, left: 0, right: 0, bottom: 0,
      zIndex: 1300, background: '#f5f6f7', overflowY: 'auto',
      animation: 'ldpIn 0.18s ease',
    }}>
      {/* ── Secondary bar: breadcrumb + back ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: '#fff', borderBottom: '1px solid #e5e7eb',
      }}>
        <div style={{
          maxWidth: 1080, margin: '0 auto',
          padding: '0 24px', height: 44,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <button
            onClick={() => setActiveListing(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontWeight: 600, color: '#1d3a6e',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0,
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back
          </button>
          <span style={{ color: '#d1d5db' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#9ca3af', overflow: 'hidden' }}>
            <a
              href="/"
              onClick={e => { e.preventDefault(); setActiveListing(null) }}
              style={{ cursor: 'pointer', color: '#6b7280', flexShrink: 0, textDecoration: 'none' }}
            >Home</a>
            <span>›</span>
            <a
              href={catSlug ? `/${catSlug}` : '#'}
              onClick={e => { e.preventDefault(); setActiveListing(null); setActiveCategory(category) }}
              style={{ color: '#6b7280', flexShrink: 0, textDecoration: 'none' }}
            >{catLabel}</a>
            {location && (
              <>
                <span>›</span>
                <a
                  href={catSlug ? `/${catSlug}/${cityToSlug(location)}` : '#'}
                  onClick={e => { e.preventDefault(); setActiveListing(null); setActiveCategory(category); setActiveLocation(location) }}
                  style={{ color: '#6b7280', flexShrink: 0, textDecoration: 'none' }}
                >{location}</a>
              </>
            )}
            <span>›</span>
            <span style={{ color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
          </div>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 1080, margin: '0 auto', padding: '24px 24px 60px' }}>

        {/* Title + price row */}
        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          gap: 16, marginBottom: 20,
        }}>
          <div>
            {badge && (
              <span className={`lc-badge ${badge_class}`} style={{ marginBottom: 8, display: 'inline-block' }}>
                {badge}
              </span>
            )}
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', lineHeight: 1.3, letterSpacing: '-0.3px', margin: 0 }}>
              {title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6, fontSize: 12, color: '#9ca3af' }}>
              {location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><PinIcon />{location}</span>}
              {postedDate && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CalIcon />Posted on {postedDate}</span>}
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontSize: 30, fontWeight: 900, color: '#e8473f', letterSpacing: '-1px', lineHeight: 1 }}>
              {formatPriceFull(price)}
            </div>
            {original_price && original_price > price && (
              <div style={{ fontSize: 14, color: '#9ca3af', textDecoration: 'line-through', marginTop: 2 }}>
                {formatPrice(original_price)}
              </div>
            )}
            {discount > 0 && (
              <span style={{ display: 'inline-block', marginTop: 4, fontSize: 11, fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '3px 8px', borderRadius: 99 }}>
                {discount}% OFF
              </span>
            )}
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="ldp-cols">

          {/* Left: image gallery + details */}
          <div className="ldp-left">
            {/* Main image */}
            <div className={gradient || 'li2'} style={{
              borderRadius: 14, overflow: 'hidden',
              position: 'relative', width: '100%', aspectRatio: '4/3',
              background: '#ececec', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {hasImages ? (
                <>
                  <img
                    key={currentImg}
                    src={images[currentImg]}
                    alt={title}
                    loading="eager"
                    fetchPriority="high"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  {total > 1 && (
                    <>
                      <button onClick={prev} style={arrowBtn('left')}><ChevL /></button>
                      <button onClick={next} style={arrowBtn('right')}><ChevR /></button>
                      <div style={{
                        position: 'absolute', bottom: 12, right: 14,
                        background: 'rgba(0,0,0,0.5)', color: '#fff',
                        fontSize: 12, fontWeight: 600, padding: '4px 10px', borderRadius: 99, zIndex: 5,
                      }}>{currentImg + 1} / {total}</div>
                    </>
                  )}
                </>
              ) : (
                <div style={{ color: 'rgba(0,0,0,0.15)', transform: 'scale(3.5)', display: 'flex' }}>
                  {catIcon}
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {total > 1 && (
              <div style={{ display: 'flex', gap: 8, marginTop: 10, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                {images.map((src, i) => (
                  <button key={i} onClick={() => setCurrentImg(i)} style={{
                    width: 68, height: 68, flexShrink: 0, borderRadius: 10,
                    overflow: 'hidden', padding: 0, cursor: 'pointer',
                    border: `2.5px solid ${i === currentImg ? '#1d3a6e' : 'transparent'}`,
                    opacity: i === currentImg ? 1 : 0.6, transition: 'all 0.15s', background: '#ececec',
                  }}>
                    <img src={src} alt={`${title} photo ${i + 1}`} loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </button>
                ))}
              </div>
            )}

            {/* Item Overview */}
            {tags?.length > 0 && (
              <div style={{ marginTop: 28 }}>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1a1a2e', margin: '0 0 14px' }}>Item Overview</h3>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {tags.map(t => (
                    <div key={t} style={{
                      padding: '10px 18px', borderRadius: 10,
                      background: '#fff', border: '1.5px solid #e5e7eb',
                      fontSize: 13, fontWeight: 600, color: '#374151',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    }}>{t}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {description && (
              <div style={{ marginTop: 28 }}>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1a1a2e', margin: '0 0 12px' }}>Description</h3>
                <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e5e7eb', padding: '18px 20px' }}>
                  <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.85, whiteSpace: 'pre-line', margin: 0 }}>
                    {description}
                  </p>
                </div>
              </div>
            )}

            {/* Safety tip */}
            <div style={{
              marginTop: 24, padding: '12px 16px', borderRadius: 10,
              background: '#fffbeb', border: '1px solid #fde68a',
              fontSize: 12.5, color: '#92400e', display: 'flex', gap: 10, alignItems: 'flex-start',
            }}>
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="3" />
              </svg>
              <span><strong>Safety tip:</strong> Never pay in advance. Always meet in a public place and inspect before buying.</span>
            </div>
          </div>

          {/* Right: sidebar */}
          <div className="ldp-right">

            {/* Seller card */}
            <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e5e7eb', padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%',
                  background: seller_color || '#4a4e69', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16, fontWeight: 800, color: '#fff',
                }}>
                  {seller_initials}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', display: 'flex', alignItems: 'center', gap: 5 }}>
                    {seller_name}
                    {sellerVerified && (
                      <span title="Verified seller" style={{ background: '#1d3a6e', color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 8, fontWeight: 900, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>✓</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Member · BazaarTrade</div>
                </div>
              </div>

              {isOwner ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {isSold ? (
                    <>
                      {/* Sold banner */}
                      <div style={{
                        padding: '11px 14px', borderRadius: 10,
                        background: '#fef3c7', border: '1px solid #fde68a',
                        fontSize: 12.5, color: '#92400e',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, marginBottom: 4 }}>
                          <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                          </svg>
                          Marked as Sold
                        </div>
                        <div style={{ lineHeight: 1.55, paddingLeft: 19 }}>
                          Listing removes in 48 hrs. Unmark it to keep it active.
                        </div>
                      </div>
                      <button onClick={handleUnmarkSold} style={{
                        width: '100%', padding: '13px', borderRadius: 10,
                        background: '#ecfdf5', color: '#059669',
                        border: '1.5px solid #a7f3d0', cursor: 'pointer',
                        fontSize: 14, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      }}>
                        <TagIcon /> Unmark as Sold
                      </button>
                      <button onClick={handleDelete} disabled={deleting} style={{
                        width: '100%', padding: '13px', borderRadius: 10,
                        background: '#fff', color: '#dc2626',
                        border: '1.5px solid #fca5a5', cursor: 'pointer',
                        fontSize: 14, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      }}>
                        <TrashIcon /> {deleting ? 'Deleting…' : 'Delete Ad'}
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={handleMarkSold} style={{
                        width: '100%', padding: '13px', borderRadius: 10,
                        background: '#1d3a6e', color: '#fff',
                        fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      }}>
                        <TagIcon /> Mark as Sold
                      </button>
                      <button onClick={handleDelete} disabled={deleting} style={{
                        width: '100%', padding: '13px', borderRadius: 10,
                        background: '#fff', color: '#dc2626',
                        border: '1.5px solid #fca5a5', cursor: 'pointer',
                        fontSize: 14, fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      }}>
                        <TrashIcon /> {deleting ? 'Deleting…' : 'Delete Ad'}
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button onClick={handleContact} style={{
                    width: '100%', padding: '13px', borderRadius: 10,
                    background: '#1d3a6e', color: '#fff',
                    fontSize: 14, fontWeight: 700, border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = '#22223b'}
                    onMouseLeave={e => e.currentTarget.style.background = '#1d3a6e'}
                  >
                    <ChatIcon /> Chat With Seller
                  </button>
                  <button onClick={handleSave} style={{
                    width: '100%', padding: '13px', borderRadius: 10,
                    border: `1.5px solid ${saved ? '#fca5a5' : '#e5e7eb'}`,
                    background: saved ? '#fff5f5' : '#fff',
                    color: saved ? '#e8473f' : '#374151',
                    fontSize: 14, fontWeight: 700, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'all 0.15s',
                  }}>
                    <HeartIcon filled={saved} />
                    {saved ? 'Saved' : 'Save to Wishlist'}
                  </button>
                  {/* Add to Cart */}
                  {(() => {
                    const inCart = cart.some(c => c.id === listing?.id)
                    if (!inCart) {
                      return (
                        <button
                          onClick={() => { addToCart(listing); showToast('Added to cart', '🛒') }}
                          style={{
                            width: '100%', padding: '13px', borderRadius: 10,
                            border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151',
                            fontSize: 14, fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            transition: 'all 0.15s',
                          }}
                        >
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                          </svg>
                          Add to Cart
                        </button>
                      )
                    }
                    return (
                      <div style={{
                        width: '100%', borderRadius: 10, display: 'flex', overflow: 'hidden',
                        border: '1.5px solid #bfdbfe', background: '#eff6ff',
                      }}>
                        <button
                          onClick={() => { setActiveListing(null); setCartOpen(true) }}
                          style={{
                            flex: 1, padding: '13px', border: 'none', background: 'transparent',
                            color: '#1d4ed8', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          }}
                        >
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>
                          </svg>
                          In Cart · View Cart
                        </button>
                        <button
                          onClick={() => { removeFromCart(listing.id); showToast('Removed from cart', '🛒') }}
                          title="Remove from cart"
                          style={{
                            padding: '13px 16px', border: 'none', borderLeft: '1.5px solid #bfdbfe',
                            background: 'transparent', color: '#1d4ed8', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6M10 11v6M14 11v6M9 6V4h6v2" />
                          </svg>
                        </button>
                      </div>
                    )
                  })()}
                </div>
              )}
            </div>

            {/* Category */}
            <div style={{ background: '#fff', borderRadius: 12, border: '1.5px solid #e5e7eb', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{catIcon}</span>
              <div>
                <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', textTransform: 'capitalize', marginTop: 2 }}>{category}</div>
              </div>
            </div>

            {/* Report */}
            {!isOwner && (
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: '#9ca3af', display: 'flex', alignItems: 'center', gap: 5, padding: '4px 0' }}>
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
                </svg>
                Report this ad
              </button>
            )}
          </div>
        </div>

        {/* ── Similar Products ── */}
        {similar.length > 0 && (
          <div style={{ marginTop: 48 }}>
            <h3 style={{ fontSize: 19, fontWeight: 800, color: '#1a1a2e', margin: '0 0 18px', letterSpacing: '-0.2px' }}>
              Similar Products
            </h3>
            <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'thin' }}>
              {similar.map(l => (
                <div
                  key={l.id}
                  onClick={() => { setActiveListing(l) }}
                  style={{
                    flexShrink: 0, width: 180, borderRadius: 14, overflow: 'hidden',
                    background: '#fff', border: '1.5px solid #e5e7eb',
                    cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                    transition: 'transform 0.15s, box-shadow 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)' }}
                >
                  {/* Thumbnail */}
                  <div className={l.gradient || 'li2'} style={{ height: 130, position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {l.images?.[0]
                      ? <img src={l.images[0]} alt={l.title} loading="lazy" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ color: 'rgba(0,0,0,0.2)', display: 'flex', transform: 'scale(1.8)' }}>{categoryIcons[l.category] ?? categoryIcons['all']}</span>
                    }
                    {l.images?.length > 1 && (
                      <div style={{ position: 'absolute', bottom: 6, left: 6, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: 9, fontWeight: 600, padding: '2px 6px', borderRadius: 4 }}>
                        {l.images.length}
                      </div>
                    )}
                  </div>
                  {/* Info */}
                  <div style={{ padding: '10px 12px 12px' }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 4 }}>{l.title}</div>
                    <div style={{ fontSize: 15, fontWeight: 900, color: '#e8473f' }}>{formatPriceFull(l.price)}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 3, display: 'flex', alignItems: 'center', gap: 3 }}>
                      <PinIcon />{l.location}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes ldpIn { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }
        .ldp-cols { display: flex; gap: 24px; align-items: flex-start; }
        .ldp-left { flex: 1; min-width: 0; }
        .ldp-right { width: 300px; flex-shrink: 0; display: flex; flex-direction: column; gap: 12px; position: sticky; top: 68px; }
        @media (max-width: 720px) {
          .ldp-cols { flex-direction: column; }
          .ldp-right { width: 100%; position: static; }
        }
      `}</style>
    </div>
  )
}

function arrowBtn(side) {
  return {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)',
    [side]: 12, zIndex: 5,
    width: 40, height: 40, borderRadius: '50%',
    background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(0,0,0,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  }
}
