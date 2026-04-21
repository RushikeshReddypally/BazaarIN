import { useEffect } from 'react'

export function useNavScroll() {
  useEffect(() => {
    const nav = document.getElementById('nav')
    const onScroll = () => nav?.classList.toggle('scrolled', window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
}
