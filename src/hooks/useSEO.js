import { useEffect } from 'react'

const SITE = 'BazaarTrade.in'
const BASE_URL = 'https://baazartrade.in'
const DEFAULT_DESC = "India's trusted free marketplace. Buy and sell mobiles, cars, property, bikes, electronics and more. Post ads free!"
const DEFAULT_IMG = `${BASE_URL}/og-image.jpg`

function setMeta(selector, attr, content) {
  let el = document.querySelector(selector)
  if (!el) {
    el = document.createElement('meta')
    const [a, v] = selector.replace('meta[', '').replace(']', '').split('="')
    el.setAttribute(a, v.replace('"', ''))
    document.head.appendChild(el)
  }
  el.setAttribute(attr, content)
}

function setJsonLD(id, data) {
  let el = document.getElementById(id)
  if (!el) {
    el = document.createElement('script')
    el.type = 'application/ld+json'
    el.id = id
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

function removeJsonLD(id) {
  document.getElementById(id)?.remove()
}

export function useSEO({ title, description, image, url, type = 'website', listing } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} | ${SITE}` : `${SITE} — Buy & Sell Anything Across India for Free`
    const desc = description || DEFAULT_DESC
    const img = image || DEFAULT_IMG
    const canonical = url ? `${BASE_URL}${url}` : BASE_URL

    document.title = fullTitle

    // Primary
    setMeta('meta[name="description"]', 'content', desc)

    // Canonical
    let canonEl = document.querySelector('link[rel="canonical"]')
    if (!canonEl) { canonEl = document.createElement('link'); canonEl.rel = 'canonical'; document.head.appendChild(canonEl) }
    canonEl.href = canonical

    // OG
    setMeta('meta[property="og:title"]', 'content', fullTitle)
    setMeta('meta[property="og:description"]', 'content', desc)
    setMeta('meta[property="og:image"]', 'content', img)
    setMeta('meta[property="og:url"]', 'content', canonical)
    setMeta('meta[property="og:type"]', 'content', type)

    // Twitter
    setMeta('meta[name="twitter:title"]', 'content', fullTitle)
    setMeta('meta[name="twitter:description"]', 'content', desc)
    setMeta('meta[name="twitter:image"]', 'content', img)

    // Listing JSON-LD (Product schema)
    if (listing) {
      setJsonLD('listing-jsonld', {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: listing.title,
        description: listing.description || desc,
        image: listing.images?.length ? listing.images : [img],
        url: canonical,
        offers: {
          '@type': 'Offer',
          price: listing.price,
          priceCurrency: 'INR',
          availability: 'https://schema.org/InStock',
          seller: { '@type': 'Person', name: listing.seller_name },
          areaServed: listing.location,
        },
        category: listing.category,
      })
    } else {
      removeJsonLD('listing-jsonld')
    }

    return () => {
      // Reset to defaults when unmounted (e.g. listing closed)
      if (title) {
        document.title = `${SITE} — Buy & Sell Anything Across India for Free`
        setMeta('meta[name="description"]', 'content', DEFAULT_DESC)
        setMeta('meta[property="og:title"]', 'content', `${SITE} — Buy & Sell Anything Across India for Free`)
        setMeta('meta[property="og:description"]', 'content', DEFAULT_DESC)
        setMeta('meta[property="og:image"]', 'content', DEFAULT_IMG)
        removeJsonLD('listing-jsonld')
      }
    }
  }, [title, description, image, url, type, listing])
}
