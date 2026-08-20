import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { parsePathname, buildPath, buildListingPath, parseListingId } from '../utils/routing'
import { SLUG_TO_PAGE, PAGE_SLUGS } from '../data/contentPages'

// Read initial content page from URL path (e.g. /about → 'About Us'), if any
function getInitContentPage() {
  const slug = window.location.pathname.replace(/^\//, '').split('/')[0]
  return SLUG_TO_PAGE[slug] || null
}

const AppContext = createContext(null)

// Read initial category from URL path (e.g. /cars/mumbai → vehicles)
function getInitCat() {
  return parsePathname(window.location.pathname).cat
}

// Read initial location from URL path, fall back to localStorage
function getInitLoc() {
  const { loc } = parsePathname(window.location.pathname)
  if (loc) {
    if (!localStorage.getItem('bt_location')) localStorage.setItem('bt_location', loc)
    return loc
  }
  return localStorage.getItem('bt_location') || 'all'
}

export function AppProvider({ children }) {
  const [loginOpen, setLoginOpenRaw] = useState(false)
  const [postOpen, setPostOpenRaw] = useState(false)
  const [listingsKey, setListingsKey] = useState(0)
  const [profileOpen, setProfileOpenRaw] = useState(false)
  const [profileTab, setProfileTab] = useState('basic')
  const [activeContentPage, setActiveContentPageRaw] = useState(getInitContentPage)
  const [myAdsOpen, setMyAdsOpenRaw] = useState(false)
  const [messagesOpen, setMessagesOpenRaw] = useState(false)
  const [favouritesOpen, setFavouritesOpenRaw] = useState(false)
  const [activeListing, setActiveListingRaw] = useState(null)
  const [chatListing, setChatListing] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)
  const [toast, setToast] = useState({ show: false, msg: '', icon: '✓' })
  const [activeCategory, setActiveCategory] = useState(getInitCat)
  const [activeLocationRaw, setActiveLocationRaw] = useState(getInitLoc)
  const [welcomeOpen, setWelcomeOpen] = useState(
    () => !localStorage.getItem('bt_location')
  )
  const [user, setUser] = useState(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const [savedCount, setSavedCount] = useState(0)
  const [cartOpen, setCartOpenRaw] = useState(false)
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bt_cart') || '[]') } catch { return [] }
  })
  const [adminOpen, setAdminOpenRaw] = useState(false)
  const [notifOpen, setNotifOpenRaw] = useState(false)

  // Every full-page/modal overlay in the app is mutually exclusive — opening one closes
  // all the others. Without this, the nav bar (which sits above all of them) stays
  // clickable and lets a second overlay open on top of/behind an already-open one.
  const closeAllOverlaysExcept = useCallback((except) => {
    if (except !== 'login') setLoginOpenRaw(false)
    if (except !== 'post') setPostOpenRaw(false)
    if (except !== 'profile') setProfileOpenRaw(false)
    if (except !== 'myAds') setMyAdsOpenRaw(false)
    if (except !== 'messages') setMessagesOpenRaw(false)
    if (except !== 'favourites') setFavouritesOpenRaw(false)
    if (except !== 'cart') setCartOpenRaw(false)
    if (except !== 'notif') setNotifOpenRaw(false)
    if (except !== 'admin') setAdminOpenRaw(false)
    if (except !== 'listing') setActiveListingRaw(null)
    if (except !== 'content') setActiveContentPageRaw(null)
  }, [])

  const setLoginOpen = useCallback(v => { if (v) closeAllOverlaysExcept('login'); setLoginOpenRaw(v) }, [closeAllOverlaysExcept])
  const setPostOpen = useCallback(v => { if (v) closeAllOverlaysExcept('post'); setPostOpenRaw(v) }, [closeAllOverlaysExcept])
  const setProfileOpen = useCallback(v => { if (v) closeAllOverlaysExcept('profile'); setProfileOpenRaw(v) }, [closeAllOverlaysExcept])
  const setMyAdsOpen = useCallback(v => { if (v) closeAllOverlaysExcept('myAds'); setMyAdsOpenRaw(v) }, [closeAllOverlaysExcept])
  const setMessagesOpen = useCallback(v => { if (v) closeAllOverlaysExcept('messages'); setMessagesOpenRaw(v) }, [closeAllOverlaysExcept])
  const setFavouritesOpen = useCallback(v => { if (v) closeAllOverlaysExcept('favourites'); setFavouritesOpenRaw(v) }, [closeAllOverlaysExcept])
  const setCartOpen = useCallback(v => { if (v) closeAllOverlaysExcept('cart'); setCartOpenRaw(v) }, [closeAllOverlaysExcept])
  const setNotifOpen = useCallback(v => { if (v) closeAllOverlaysExcept('notif'); setNotifOpenRaw(v) }, [closeAllOverlaysExcept])
  const setAdminOpen = useCallback(v => { if (v) closeAllOverlaysExcept('admin'); setAdminOpenRaw(v) }, [closeAllOverlaysExcept])

  // Synchronously detect if we need to restore a listing from URL — prevents home page flash
  const [restoringListing, setRestoringListing] = useState(
    () => !!new URLSearchParams(window.location.search).get('listing') || !!parseListingId(window.location.pathname)
  )

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      if (event === 'SIGNED_IN') {
        const userId = session?.user?.id
        const key = `welcomed_${userId}`
        if (userId && !localStorage.getItem(key)) {
          localStorage.setItem(key, '1')
          const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || ''
          setTimeout(() => {
            setToast({ show: true, msg: `Welcome to BazaarTrade${name ? ', ' + name.split(' ')[0] : ''}!`, icon: '✓' })
            setTimeout(() => setToast(t => ({ ...t, show: false })), 3500)
          }, 500)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Restore listing from URL on mount — supports both the clean path and legacy ?listing= links
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('listing') || parseListingId(window.location.pathname)
    if (!id) return
    supabase.from('listings').select('*').eq('id', id).single()
      .then(({ data }) => {
        if (data) {
          setActiveListingRaw(data)
          // Silently upgrade old ?listing= links to the clean, canonical URL
          const cleanPath = buildListingPath(data)
          if (window.location.pathname + window.location.search !== cleanPath) {
            window.history.replaceState(null, '', cleanPath)
          }
        } else {
          // Listing gone (deleted/never existed) — URL sync effect below will fall back
          // to the category+city page already implied by the URL; let the user know why.
          setToast({ show: true, msg: 'That listing is no longer available', icon: 'ℹ️' })
          setTimeout(() => setToast(t => ({ ...t, show: false })), 3500)
        }
        setRestoringListing(false)
      })
  }, [])

  // Browser back/forward — sync state from URL
  useEffect(() => {
    function onPop() {
      const id = new URLSearchParams(window.location.search).get('listing') || parseListingId(window.location.pathname)
      if (!id) setActiveListingRaw(null)
      setActiveContentPageRaw(getInitContentPage())
      const { cat, loc } = parsePathname(window.location.pathname)
      setActiveCategory(cat)
      if (loc) setActiveLocationRaw(loc)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // Sync URL path when category or location changes (not while a listing/content page is open)
  useEffect(() => {
    if (activeListing || activeContentPage) return
    const path = buildPath(activeCategory, activeLocationRaw)
    if (window.location.pathname !== path) {
      window.history.replaceState(null, '', path)
    }
  }, [activeCategory, activeLocationRaw, activeListing, activeContentPage])

  // Fetch saved (favourites) count when user changes
  useEffect(() => {
    if (!user?.id) { setSavedCount(0); return }
    supabase
      .from('favourites')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count }) => setSavedCount(count ?? 0))
  }, [user?.id])

  // Real-time: listen for new incoming messages
  useEffect(() => {
    if (!user?.phone) { setUnreadCount(0); return }

    supabase
      .from('messages')
      .select('id', { count: 'exact' })
      .eq('receiver_phone', user.phone)
      .eq('is_read', false)
      .then(({ count }) => setUnreadCount(count ?? 0))

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

  // URL-synced setActiveListing
  const setActiveListing = useCallback((listing) => {
    if (listing?.id) closeAllOverlaysExcept('listing')
    setActiveListingRaw(listing)
    if (listing?.id) {
      window.history.pushState(null, '', buildListingPath(listing))
    } else {
      window.history.pushState(null, '', buildPath(activeCategory, activeLocationRaw))
    }
  }, [activeCategory, activeLocationRaw, closeAllOverlaysExcept])

  // URL-synced setActiveContentPage — pass a page title (e.g. 'About Us') or null to close
  const setActiveContentPage = useCallback((page) => {
    if (page) closeAllOverlaysExcept('content')
    setActiveContentPageRaw(page)
    if (page && PAGE_SLUGS[page]) {
      window.history.pushState(null, '', `/${PAGE_SLUGS[page]}`)
    } else {
      window.history.pushState(null, '', buildPath(activeCategory, activeLocationRaw))
    }
  }, [activeCategory, activeLocationRaw, closeAllOverlaysExcept])

  const addToCart = useCallback((listing) => {
    setCart(prev => {
      if (prev.find(l => l.id === listing.id)) return prev
      const next = [...prev, listing]
      localStorage.setItem('bt_cart', JSON.stringify(next))
      return next
    })
  }, [])

  const removeFromCart = useCallback((id) => {
    setCart(prev => {
      const next = prev.filter(l => l.id !== id)
      localStorage.setItem('bt_cart', JSON.stringify(next))
      return next
    })
  }, [])

  const deleteAccount = useCallback(async () => {
    if (!user) return
    await supabase.from('listings').delete().eq('seller_id', user.id)
    await supabase.from('favourites').delete().eq('user_id', user.id)
    await supabase.auth.signOut()
    setCart([])
    localStorage.removeItem('bt_cart')
    localStorage.removeItem('bt_location')
  }, [user])

  const setActiveLocation = useCallback((loc) => {
    setActiveLocationRaw(loc)
    // Persist 'all' too (e.g. "Skip" on the welcome modal) so the choice isn't asked again every visit
    if (loc) localStorage.setItem('bt_location', loc)
    else localStorage.removeItem('bt_location')
  }, [])

  const changeSavedCount = useCallback((delta) => {
    setSavedCount(n => Math.max(0, n + delta))
  }, [])

  const bumpListings = useCallback(() => setListingsKey(k => k + 1), [])

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

  const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
  const SEO_EMAILS = (import.meta.env.VITE_SEO_EMAILS || '').split(',').map(e => e.trim().toLowerCase())
  const isAdminUser = !!user && ADMIN_EMAILS.includes(user.email?.toLowerCase())
  const isSEOUser = !!user && SEO_EMAILS.includes(user.email?.toLowerCase())

  return (
    <AppContext.Provider value={{
      loginOpen, setLoginOpen,
      postOpen, setPostOpen,
      profileOpen, setProfileOpen,
      profileTab, setProfileTab,
      myAdsOpen, setMyAdsOpen,
      messagesOpen, setMessagesOpen,
      favouritesOpen, setFavouritesOpen,
      activeListing, setActiveListing,
      activeContentPage, setActiveContentPage,
      chatListing, setChatListing,
      pendingAction, setPendingAction,
      toast, showToast,
      activeCategory, setActiveCategory,
      activeLocation: activeLocationRaw, setActiveLocation,
      welcomeOpen, setWelcomeOpen,
      user, logout,
      unreadCount, clearUnread,
      savedCount, changeSavedCount,
      cartOpen, setCartOpen,
      cart, addToCart, removeFromCart,
      deleteAccount,
      listingsKey, bumpListings,
      restoringListing,
      adminOpen, setAdminOpen, isAdminUser, isSEOUser,
      notifOpen, setNotifOpen,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
