import { useEffect } from 'react'
import { AppProvider } from './context/AppContext'
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
