import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'
import { formatPriceFull } from '../utils/format'

export default function FavouritesModal() {
  const { favouritesOpen, setFavouritesOpen, user, setLoginOpen, setActiveListing, showToast } = useApp()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!favouritesOpen || !user) return
    setLoading(true)
    supabase
      .from('favourites')
      .select('listing_id, listings(*)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setItems((data ?? []).map(r => r.listings).filter(Boolean))
        setLoading(false)
      })
  }, [favouritesOpen, user])

  async function remove(listingId) {
    const { error } = await supabase
      .from('favourites')
      .delete()
      .eq('user_id', user.id)
      .eq('listing_id', listingId)
    if (!error) {
      setItems(prev => prev.filter(l => l.id !== listingId))
      showToast('Removed from wishlist', '🗑️')
    }
  }

  function close() { setFavouritesOpen(false) }

  return (
    <div className={`overlay${favouritesOpen ? ' open' : ''}`} style={{ zIndex: 1300 }} onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal modal-wide" style={{ maxWidth: 560, padding: '32px 28px 28px' }}>
        <button className="modal-x" onClick={close}>✕</button>
        <div className="modal-logo">Saved Items</div>
        <p className="modal-sub">Your wishlist</p>

        {!user ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
            <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>Sign in to view your saved items</div>
            <button onClick={() => { close(); setLoginOpen(true) }} style={{ padding: '10px 24px', borderRadius: 99, background: '#1d3a6e', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              Sign In
            </button>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>Loading…</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🤍</div>
            <div style={{ color: '#6b7280', fontSize: 14 }}>No saved items yet. Tap the heart on any listing!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 460, overflowY: 'auto' }}>
            {items.map(listing => (
              <div key={listing.id} style={{
                display: 'flex', gap: 14, alignItems: 'center',
                padding: '12px 14px', borderRadius: 14,
                border: '1.5px solid #f3f4f6', background: '#fafafa',
              }}>
                <div
                  className={listing.gradient || 'li1'}
                  onClick={() => { close(); setActiveListing(listing) }}
                  style={{
                    width: 60, height: 60, borderRadius: 10, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26, cursor: 'pointer', overflow: 'hidden',
                  }}
                >
                  {listing.images?.[0]
                    ? <img src={listing.images[0]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : listing.emoji}
                </div>

                <div
                  style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                  onClick={() => { close(); setActiveListing(listing) }}
                >
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {listing.title}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#1d3a6e', marginTop: 2 }}>
                    {formatPriceFull(listing.price)}
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>📍 {listing.location}</div>
                </div>

                <button
                  onClick={() => remove(listing.id)}
                  title="Remove from wishlist"
                  style={{
                    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                    border: '1.5px solid #fca5a5', background: '#fff5f5',
                    cursor: 'pointer', fontSize: 16,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >🗑️</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
