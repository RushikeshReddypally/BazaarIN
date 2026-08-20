import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function NotificationsModal() {
  const { notifOpen, setNotifOpen, user, setLoginOpen, setChatListing, clearUnread } = useApp()
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(false)
  const [opening, setOpening] = useState(null)

  useEffect(() => {
    if (!notifOpen || !user?.phone) return
    setLoading(true)
    supabase
      .from('messages')
      .select('*')
      .eq('receiver_phone', user.phone)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        // Keep latest message per listing_id
        const map = {}
        ;(data || []).forEach(m => {
          if (!map[m.listing_id]) map[m.listing_id] = m
        })
        setThreads(Object.values(map))
        setLoading(false)
      })
  }, [notifOpen, user?.phone])

  async function markAllRead() {
    if (!user?.phone) return
    await supabase.from('messages').update({ is_read: true }).eq('receiver_phone', user.phone).eq('is_read', false)
    setThreads(prev => prev.map(t => ({ ...t, is_read: true })))
    clearUnread()
  }

  async function openChat(thread) {
    setOpening(thread.listing_id)
    // Mark this thread's messages as read
    await supabase.from('messages').update({ is_read: true }).eq('listing_id', thread.listing_id).eq('receiver_phone', user.phone)
    setThreads(prev => prev.map(t => t.listing_id === thread.listing_id ? { ...t, is_read: true } : t))
    // Fetch listing and open chat
    const { data } = await supabase.from('listings').select('*').eq('id', thread.listing_id).single()
    setOpening(null)
    setNotifOpen(false)
    if (data) setChatListing(data)
  }

  function close() { setNotifOpen(false) }

  const unread = threads.filter(t => !t.is_read).length

  return (
    <div
      className={`overlay${notifOpen ? ' open' : ''}`}
      style={{ zIndex: 1300 }}
      onClick={e => e.target === e.currentTarget && close()}
    >
      <div className="modal modal-wide" style={{ maxWidth: 460, padding: 0, overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 22px 14px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e' }}>Notifications</div>
            {unread > 0 && (
              <span style={{ background: '#e8473f', color: '#fff', fontSize: 11, fontWeight: 800, padding: '2px 8px', borderRadius: 99 }}>
                {unread} new
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                style={{ fontSize: 12, fontWeight: 600, color: '#1d3a6e', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px', borderRadius: 6 }}
              >
                Mark all read
              </button>
            )}
            <button className="modal-x" onClick={close} style={{ position: 'static', width: 30, height: 30 }}>✕</button>
          </div>
        </div>

        {/* Content */}
        <div style={{ minHeight: 200, maxHeight: 500, overflowY: 'auto' }}>
          {!user ? (
            <div style={{ textAlign: 'center', padding: '40px 24px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
              <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 16 }}>Sign in to see your notifications</div>
              <button
                onClick={() => { close(); setLoginOpen(true) }}
                style={{ padding: '10px 24px', borderRadius: 99, background: '#1d3a6e', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 }}
              >
                Sign In
              </button>
            </div>
          ) : loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48, gap: 10, color: '#9ca3af', fontSize: 13 }}>
              <div style={{ width: 18, height: 18, border: '2px solid #e5e7eb', borderTopColor: '#1d3a6e', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              Loading…
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            </div>
          ) : threads.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🔔</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', marginBottom: 6 }}>All caught up!</div>
              <div style={{ color: '#9ca3af', fontSize: 13 }}>No notifications yet. When buyers message you, they'll appear here.</div>
            </div>
          ) : (
            <div>
              {threads.map(t => (
                <div
                  key={t.listing_id}
                  onClick={() => openChat(t)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 14,
                    padding: '14px 20px',
                    cursor: opening === t.listing_id ? 'wait' : 'pointer',
                    borderBottom: '1px solid #f9fafb',
                    background: t.is_read ? 'transparent' : '#fafbff',
                    transition: 'background 0.12s',
                    position: 'relative',
                  }}
                  onMouseEnter={e => { if (opening !== t.listing_id) e.currentTarget.style.background = t.is_read ? '#f9fafb' : '#f3f6ff' }}
                  onMouseLeave={e => e.currentTarget.style.background = t.is_read ? 'transparent' : '#fafbff'}
                >
                  {/* Unread dot */}
                  {!t.is_read && (
                    <div style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', width: 7, height: 7, borderRadius: '50%', background: '#1d3a6e' }} />
                  )}

                  {/* Icon */}
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: t.is_read ? '#f3f4f6' : '#e8edf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                    💬
                  </div>

                  {/* Text */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: t.is_read ? 500 : 700, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      New message about "{t.listing_title || 'your listing'}"
                    </div>
                    <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.message}
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>{timeAgo(t.created_at)}</div>
                  </div>

                  {/* Loading spinner for this item */}
                  {opening === t.listing_id && (
                    <div style={{ width: 16, height: 16, border: '2px solid #e5e7eb', borderTopColor: '#1d3a6e', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
