import { useApp } from '../context/AppContext'
import { formatPrice } from '../utils/format'

const GRAD_BG = {
  li1: 'linear-gradient(145deg,#ece4f0,#ddd4e8)',
  li2: 'linear-gradient(145deg,#f0e8e4,#e6d8d2)',
  li3: 'linear-gradient(145deg,#e4ecf0,#d4e2ea)',
  li4: 'linear-gradient(145deg,#eee8f0,#e0d6ea)',
  li5: 'linear-gradient(145deg,#f0ede4,#e6e0d2)',
  li6: 'linear-gradient(145deg,#e4f0ec,#d4eae2)',
}

export default function CartModal() {
  const { cartOpen, setCartOpen, cart, removeFromCart, setActiveListing } = useApp()
  if (!cartOpen) return null

  function openListing(item) {
    setCartOpen(false)
    setActiveListing(item)
  }

  return (
    <div style={{
      position: 'fixed', top: 62, left: 0, right: 0, bottom: 0,
      zIndex: 1300, background: '#f5f6f7', overflowY: 'auto',
      animation: 'cartPageIn 0.18s ease',
    }}>
      {/* ── Secondary bar: back button ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 20,
        background: '#fff', borderBottom: '1px solid #e5e7eb',
      }}>
        <div style={{
          maxWidth: 720, margin: '0 auto',
          padding: '0 24px', height: 44,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <button
            onClick={() => setCartOpen(false)}
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
          <span style={{ fontSize: 12, color: '#9ca3af' }}>My Cart</span>
        </div>
      </div>

      {/* ── Main content ── */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 24px 60px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px' }}>My Cart</h1>
        <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 20px' }}>
          {cart.length} item{cart.length !== 1 ? 's' : ''} saved
        </p>

        {cart.length === 0 ? (
          <div style={{
            background: '#fff', borderRadius: 14, border: '1.5px solid #e5e7eb',
            padding: '60px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 44, marginBottom: 14 }}>🛒</div>
            <p style={{ fontWeight: 700, color: '#374151', marginBottom: 6, fontSize: 16 }}>Your cart is empty</p>
            <p style={{ fontSize: 13.5, color: '#9ca3af' }}>Add listings you're interested in and come back to them later</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {cart.map(item => (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '14px 16px', background: '#fff',
                  borderRadius: 12, border: '1.5px solid #e5e7eb',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                }}
              >
                {/* Thumbnail */}
                <div
                  onClick={() => openListing(item)}
                  style={{
                    width: 72, height: 72, borderRadius: 10, flexShrink: 0,
                    background: GRAD_BG[item.gradient] || GRAD_BG.li1,
                    overflow: 'hidden', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 26,
                  }}
                >
                  {item.images?.length > 0
                    ? <img src={item.images[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : item.emoji}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    onClick={() => openListing(item)}
                    style={{ fontSize: 14.5, fontWeight: 700, color: '#1a1a2e', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 3 }}
                  >
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 5 }}>
                    {item.location} · {item.category}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#e8473f' }}>
                    {formatPrice(item.price)}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => openListing(item)}
                    style={{
                      fontSize: 12, fontWeight: 600, padding: '6px 14px',
                      background: '#1a1a2e', color: '#fff', borderRadius: 99, border: 'none', cursor: 'pointer',
                    }}
                  >
                    View
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{
                      fontSize: 12, fontWeight: 600, padding: '6px 14px',
                      background: 'transparent', color: '#e8473f', borderRadius: 99, border: '1px solid #fca5a5', cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes cartPageIn { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }`}</style>
    </div>
  )
}
