import { useEffect } from 'react'

export function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in')
          observer.unobserve(e.target)
        }
      }),
      { threshold: 0.1 }
    )

    const observe = () =>
      document.querySelectorAll('.reveal:not(.in)').forEach(el => observer.observe(el))

    observe()

    // re-scan after short delay to catch dynamically rendered elements
    const t = setTimeout(observe, 200)
    return () => { observer.disconnect(); clearTimeout(t) }
  }, [])
}
