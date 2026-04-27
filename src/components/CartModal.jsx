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
    setActiveListing(item)
    setCartOpen(false)
  }

  return (
    <div
      className="overlay open"
      onClick={e => e.target === e.currentTarget && setCartOpen(false)}
    >
      <div className="modal modal-wide" style={{ maxWidth: 560 }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 16px', borderBottom: '1px solid #f3f4f6',
        }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>My Cart</h2>
            <p style={{ fontSize: 12.5, color: '#9ca3af', marginTop: 2 }}>
              {cart.length} item{cart.length !== 1 ? 's' : ''} saved
            </p>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            style={{ width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #e5e7eb', background: 'none', cursor: 'pointer', fontSize: 16, color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >✕</button>
        </div>

        {/* Content */}
        <div style={{ maxHeight: '70vh', overflowY: 'auto', padding: '8px 0' }}>
          {cart.length === 0 ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🛒</div>
              <p style={{ fontWeight: 700, color: '#374151', marginBottom: 6 }}>Your cart is empty</p>
              <p style={{ fontSize: 13, color: '#9ca3af' }}>Add listings you're interested in and come back to them later</p>
            </div>
          ) : (
            cart.map(item => (
              <div
                key={item.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '12px 20px',
                  borderBottom: '1px solid #f9fafb',
                }}
              >
                {/* Thumbnail */}
                <div
                  onClick={() => openListing(item)}
                  style={{
                    width: 64, height: 64, borderRadius: 10, flexShrink: 0,
                    background: GRAD_BG[item.gradient] || GRAD_BG.li1,
                    overflow: 'hidden', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 24,
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
                    style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', cursor: 'pointer', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginBottom: 2 }}
                  >
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>
                    {item.location} · {item.category}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#e8473f' }}>
                    {formatPrice(item.price)}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                  <button
                    onClick={() => openListing(item)}
                    style={{
                      fontSize: 11.5, fontWeight: 600, padding: '5px 12px',
                      background: '#1a1a2e', color: '#fff', borderRadius: 6, border: 'none', cursor: 'pointer',
                    }}
                  >
                    View
                  </button>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    style={{
                      fontSize: 11.5, fontWeight: 600, padding: '5px 12px',
                      background: 'transparent', color: '#e8473f', borderRadius: 6, border: '1px solid #fca5a5', cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
