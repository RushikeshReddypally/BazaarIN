import { useEffect } from 'react'
import { AppProvider } from './context/AppContext'
import { useScrollReveal } from './hooks/useScrollReveal'
import Nav from './components/Nav'
import Hero from './components/Hero'
import CategoryStrip from './components/CategoryStrip'
import Listings from './components/Listings'
import SellCTA from './components/SellCTA'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'
import Locations from './components/Locations'
import Contact from './components/Contact'
import Footer from './components/Footer'
import LoginModal from './components/LoginModal'
import PostAdModal from './components/PostAdModal'
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
        <Locations />
        <Contact />
      </main>
      <Footer />
      <LoginModal />
      <PostAdModal />
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
