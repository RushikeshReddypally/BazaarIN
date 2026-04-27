import { useEffect } from 'react'
import { AppProvider } from './context/AppContext'
import { useApp } from './context/AppContext'
import { useScrollReveal } from './hooks/useScrollReveal'
import { useSEO } from './hooks/useSEO'
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
import CartModal from './components/CartModal'
import WelcomeModal from './components/WelcomeModal'
import AdminModal from './components/AdminModal'
import Toast from './components/Toast'

const CATEGORY_SEO = {
  vehicles:    { title: 'Buy & Sell Cars in India',         description: 'Find used and new cars, SUVs, trucks and vehicles for sale across India. Post your car ad free on BazaarTrade.' },
  bikes:       { title: 'Buy & Sell Bikes in India',        description: 'Browse second hand motorcycles, scooters and bicycles across India. Sell your bike free on BazaarTrade.' },
  mobiles:     { title: 'Buy & Sell Mobile Phones in India',description: 'Find used and new smartphones, feature phones and accessories. Buy or sell mobiles free on BazaarTrade.' },
  electronics: { title: 'Buy & Sell Electronics in India',  description: 'Browse laptops, TVs, cameras, ACs and all electronics. Buy or sell electronics free on BazaarTrade.' },
  property:    { title: 'Property for Sale & Rent in India',description: 'Find flats, houses, plots and commercial property across India. Post property ads free on BazaarTrade.' },
  furniture:   { title: 'Buy & Sell Furniture in India',    description: 'Find used sofas, beds, tables and home furniture near you. Buy or sell furniture free on BazaarTrade.' },
  fashion:     { title: 'Buy & Sell Fashion & Clothing',    description: 'Browse used clothes, shoes, bags and accessories across India. Buy or sell fashion free on BazaarTrade.' },
  books:       { title: 'Buy & Sell Books in India',        description: 'Find second hand textbooks, novels and study material near you. Buy or sell books free on BazaarTrade.' },
  sports:      { title: 'Buy & Sell Sports Equipment',      description: 'Browse used sports gear, fitness equipment and outdoor items. Buy or sell sports goods free on BazaarTrade.' },
  pets:        { title: 'Pets & Pet Supplies in India',     description: 'Find pets, pet food, accessories and services near you. Post pet ads free on BazaarTrade.' },
  gaming:      { title: 'Buy & Sell Gaming in India',       description: 'Find used consoles, games and gaming accessories. Buy or sell gaming gear free on BazaarTrade.' },
  services:    { title: 'Local Services in India',          description: 'Find local services — repair, tutoring, cleaning and more. Post your service ad free on BazaarTrade.' },
  kids:        { title: 'Buy & Sell Kids Items in India',   description: 'Browse used toys, baby gear, kids clothes and more. Buy or sell kids items free on BazaarTrade.' },
}

function CategorySEO() {
  const { activeCategory } = useApp()
  const seo = CATEGORY_SEO[activeCategory] || {}
  useSEO({ title: seo.title, description: seo.description, url: activeCategory !== 'all' ? `/?category=${activeCategory}` : undefined })
  return null
}

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
      <CategorySEO />
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
      <CartModal />
      <WelcomeModal />
      <AdminModal />
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
