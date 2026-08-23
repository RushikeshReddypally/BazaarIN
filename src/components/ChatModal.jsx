import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'

/* ── Enquiry panel: opened from listing detail for a specific listing ── */
function EnquiryPane({ listing, user, onSent }) {
  const [msg, setMsg] = useState('')
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef(null)

  useEffect(() => {
    supabase
      .from('messages')
      .select('*')
      .eq('listing_id', listing.id)
      .or(`sender_id.eq.${user.id},receiver_phone.eq.${user.phone}`)
      .order('created_at', { ascending: true })
      .then(({ data }) => { setMessages(data ?? []); setLoading(false) })
  }, [listing.id, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(e) {
    e.preventDefault()
    if (!msg.trim()) return
    setSending(true)
    const { error } = await supabase.from('messages').insert({
      listing_id: listing.id,
      listing_title: listing.title,
      sender_id: user.id,
      sender_phone: user.phone,
      receiver_phone: listing.seller_name,
      message: msg.trim(),
    })
    if (!error) {
      setMessages(prev => [...prev, {
        id: Date.now(), sender_id: user.id, sender_phone: user.phone,
        message: msg.trim(), created_at: new Date().toISOString(),
      }])
      setMsg('')
      onSent?.()
    }
    setSending(false)
  }

  const isMine = m => m.sender_id === user.id

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Listing header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #f3f4f6', background: '#fafafa', display: 'flex', gap: 12, alignItems: 'center' }}>
        <div className={listing.gradient || 'li1'} style={{ width: 42, height: 42, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
          {listing.images?.[0]
            ? <img src={listing.images[0]} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
            : listing.emoji}
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e' }}>{listing.title}</div>
          <div style={{ fontSize: 12, color: '#9ca3af' }}>Seller: {listing.seller_name}</div>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: '20px 0' }}>Loading…</div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, padding: '20px 0' }}>
            Start the conversation — ask about the item!
          </div>
        ) : messages.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: isMine(m) ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '75%', padding: '10px 14px', borderRadius: 14,
              background: isMine(m) ? '#1d3a6e' : '#f3f4f6',
              color: isMine(m) ? '#fff' : '#1a1a2e',
              fontSize: 13, lineHeight: 1.5,
              borderBottomRightRadius: isMine(m) ? 4 : 14,
              borderBottomLeftRadius: isMine(m) ? 14 : 4,
            }}>
              {m.message}
              <div style={{ fontSize: 10, opacity: 0.6, marginTop: 4, textAlign: 'right' }}>
                {new Date(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={send} style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 8 }}>
        <input
          value={msg}
          onChange={e => setMsg(e.target.value)}
          placeholder="Type your message…"
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 99,
            border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none',
          }}
        />
        <button type="submit" disabled={sending || !msg.trim()} style={{
          padding: '10px 18px', borderRadius: 99,
          background: '#1d3a6e', color: '#fff', border: 'none', cursor: 'pointer',
          fontSize: 13, fontWeight: 600, opacity: (!msg.trim() || sending) ? 0.5 : 1,
        }}>
          Send
        </button>
      </form>
    </div>
  )
}

/* ── Inbox: all conversations ── */
function InboxPane({ user }) {
  const { setActiveListing, setChatListing, setMessagesOpen } = useApp()
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_phone.eq.${user.phone}`)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        // Group by listing_id, keep latest per listing
        const map = {}
        ;(data ?? []).forEach(m => {
          if (!map[m.listing_id]) map[m.listing_id] = m
        })
        setThreads(Object.values(map))
        setLoading(false)
      })
  }, [user])

  if (loading) return <div style={{ textAlign: 'center', padding: '40px 0', color: '#9ca3af' }}>Loading…</div>

  if (threads.length === 0) return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
      <div style={{ color: '#6b7280', fontSize: 14 }}>No messages yet. Enquire about a listing to start chatting.</div>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {threads.map(t => (
        <div
          key={t.listing_id}
          onClick={async () => {
            const { data } = await supabase.from('listings').select('*').eq('id', t.listing_id).single()
            if (data) { setChatListing(data); setMessagesOpen(false) }
          }}
          style={{
            padding: '14px 18px', cursor: 'pointer', borderRadius: 12,
            display: 'flex', gap: 12, alignItems: 'center',
            transition: 'background 0.12s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{
            width: 42, height: 42, borderRadius: '50%', background: '#e5e7eb',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0,
          }}>💬</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {t.listing_title || 'Listing'}
            </div>
            <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {t.sender_id === user.id ? 'You: ' : ''}{t.message}
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#d1d5db', flexShrink: 0 }}>
            {new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Main exported modals ── */

export function MessagesModal() {
  const { messagesOpen, setMessagesOpen, user, setLoginOpen, clearUnread } = useApp()

  useEffect(() => {
    if (messagesOpen && user) clearUnread?.()
  }, [messagesOpen, user])

  function close() { setMessagesOpen(false) }

  if (!messagesOpen) return null

  return (
    <div style={{
      position: 'fixed', top: 62, left: 0, right: 0, bottom: 0,
      zIndex: 1300, background: '#f5f6f7', overflowY: 'auto',
      animation: 'msgPageIn 0.18s ease',
    }}>
      {/* Secondary bar: back button */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px', height: 44, display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={close}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#1d3a6e', background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back
          </button>
          <span style={{ color: '#d1d5db' }}>|</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>Messages</span>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 24px 60px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: '0 0 20px' }}>Messages</h1>

        {user ? <InboxPane user={user} /> : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
            <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>Sign in to see your messages</div>
            <button onClick={() => { close(); setLoginOpen(true) }} style={{ padding: '10px 24px', borderRadius: 99, background: '#1d3a6e', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
              Sign In
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes msgPageIn { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }`}</style>
    </div>
  )
}

export function ChatModal() {
  const { chatListing, setChatListing, user, setLoginOpen, showToast } = useApp()

  function close() { setChatListing(null) }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1350,
        background: 'rgba(22,22,40,0.55)',
        backdropFilter: 'blur(4px)',
        display: chatListing ? 'flex' : 'none',
        alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={e => e.target === e.currentTarget && close()}
    >
      <div style={{
        background: '#fff', borderRadius: 20,
        width: '100%', maxWidth: 500, height: 540,
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{ padding: '16px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e' }}>Chat with Seller</div>
          <button onClick={close} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#9ca3af' }}>✕</button>
        </div>

        {chatListing && (
          user ? (
            <EnquiryPane listing={chatListing} user={user} onSent={() => showToast('Message sent!', '💬')} />
          ) : (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, gap: 16 }}>
              <div style={{ fontSize: 40 }}>🔒</div>
              <div style={{ color: '#6b7280', fontSize: 14 }}>Sign in to contact the seller</div>
              <button onClick={() => { close(); setLoginOpen(true) }} style={{ padding: '10px 24px', borderRadius: 99, background: '#1d3a6e', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                Sign In
              </button>
            </div>
          )
        )}
      </div>
    </div>
  )
}
