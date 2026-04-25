import { useEffect } from 'react'
import { AppProvider } from './context/AppContext'
import { useApp } from './context/AppContext'
import { useScrollReveal } from './hooks/useScrollReveal'
import Nav from './components/Nav'
import CategoryStrip from './components/CategoryStrip'
import Hero from './components/Hero'
import Listings from './components/Listings'
import SellCTA from './components/SellCTA'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import Contact from './components/Contact'
import Footer from './components/Footer'
import LoginModal from './components/LoginModal'
import PostAdModal from './components/PostAdModal'
import ProfileModal from './components/ProfileModal'
import ListingDetailModal from './components/ListingDetailModal'
import MyAdsModal from './components/MyAdsModal'
import { MessagesModal, ChatModal } from './components/ChatModal'
import FavouritesModal from './components/FavouritesModal'
import Toast from './components/Toast'

function AppInner() {
  useScrollReveal()
  const { restoringListing, activeListing } = useApp()

  // Show opaque screen while restoring listing from URL — prevents home page flash
  if (restoringListing && !activeListing) {
    return (
      <>
        <Nav />
        <div style={{
          position: 'fixed', top: 62, left: 0, right: 0, bottom: 0, zIndex: 1300,
          background: '#f5f6f7', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{ textAlign: 'center', color: '#9ca3af' }}>
            <div style={{ width: 32, height: 32, border: '3px solid #e5e7eb', borderTopColor: '#1d3a6e', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
            <div style={{ fontSize: 13 }}>Loading listing…</div>
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </>
    )
  }

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <CategoryStrip />
        <Listings />
        <SellCTA />
        <Features />
        <HowItWorks />
        <Contact />
      </main>
      <Footer />
      <LoginModal />
      <PostAdModal />
      <ProfileModal />
      <ListingDetailModal />
      <MyAdsModal />
      <MessagesModal />
      <ChatModal />
      <FavouritesModal />
      <Toast />
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  )
}
