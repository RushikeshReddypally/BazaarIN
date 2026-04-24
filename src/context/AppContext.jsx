import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [loginOpen, setLoginOpen] = useState(false)
  const [postOpen, setPostOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [myAdsOpen, setMyAdsOpen] = useState(false)
  const [messagesOpen, setMessagesOpen] = useState(false)
  const [favouritesOpen, setFavouritesOpen] = useState(false)
  const [activeListing, setActiveListing] = useState(null)
  const [chatListing, setChatListing] = useState(null)
  const [pendingAction, setPendingAction] = useState(null) // action to run after login
  const [toast, setToast] = useState({ show: false, msg: '', icon: '✓' })
  const [activeCategory, setActiveCategory] = useState('all')
  const [activeLocation, setActiveLocation] = useState('all')
  const [user, setUser] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'SIGNED_IN' && session?.user?.app_metadata?.provider === 'google') {
        const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || ''
        setTimeout(() => {
          setToast({ show: true, msg: `Welcome${name ? ', ' + name.split(' ')[0] : ''}! 👋`, icon: '✓' })
          setTimeout(() => setToast(t => ({ ...t, show: false })), 3500)
        }, 500)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  /* ── Real-time: listen for new incoming messages ── */
  useEffect(() => {
    if (!user?.phone) { setUnreadCount(0); return }

    // Fetch initial unread count
    supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('receiver_phone', user.phone)
      .eq('is_read', false)
      .then(({ count }) => setUnreadCount(count ?? 0))

    // Subscribe to new rows
    const channel = supabase
      .channel('incoming-messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_phone=eq.${user.phone}` },
        payload => {
          setUnreadCount(n => n + 1)
          setToast({ show: true, msg: `New message about "${payload.new.listing_title || 'a listing'}"`, icon: '💬' })
          setTimeout(() => setToast(t => ({ ...t, show: false })), 4000)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.phone])

  const showToast = useCallback((msg, icon = '✓') => {
    setToast({ show: true, msg, icon })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000)
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    showToast('Signed out successfully', '👋')
  }, [showToast])

  const clearUnread = useCallback(() => {
    setUnreadCount(0)
    if (user?.phone) {
      supabase.from('messages').update({ is_read: true }).eq('receiver_phone', user.phone).eq('is_read', false)
    }
  }, [user?.phone])

  return (
    <AppContext.Provider value={{
      loginOpen, setLoginOpen,
      postOpen, setPostOpen,
      profileOpen, setProfileOpen,
      myAdsOpen, setMyAdsOpen,
      messagesOpen, setMessagesOpen,
      favouritesOpen, setFavouritesOpen,
      activeListing, setActiveListing,
      chatListing, setChatListing,
      pendingAction, setPendingAction,
      toast, showToast,
      activeCategory, setActiveCategory,
      activeLocation, setActiveLocation,
      user, logout,
      unreadCount, clearUnread,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
