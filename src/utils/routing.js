import { states } from '../data/locations'

export const SLUG_TO_CAT = {
  cars: 'vehicles',
  bikes: 'bikes',
  mobiles: 'mobiles',
  electronics: 'electronics',
  property: 'property',
  furniture: 'furniture',
  fashion: 'fashion',
  books: 'books',
  sports: 'sports',
  pets: 'pets',
  gaming: 'gaming',
  services: 'services',
  kids: 'kids',
}

export const CAT_TO_SLUG = Object.fromEntries(
  Object.entries(SLUG_TO_CAT).map(([slug, cat]) => [cat, slug])
)

export function cityToSlug(city) {
  return city.trim().toLowerCase().replace(/\s+/g, '-').replace(/^-+|-+$/g, '')
}

export function slugToCity(slug) {
  if (!slug) return null
  for (const s of states) {
    for (const c of s.cities) {
      if (cityToSlug(c) === slug) return c
    }
  }
  return null
}

export function buildPath(category, location) {
  const catSlug = category && category !== 'all' ? CAT_TO_SLUG[category] : null
  const locSlug = location && location !== 'all' ? cityToSlug(location) : null
  if (!catSlug) return locSlug ? `/${locSlug}` : '/'
  return locSlug ? `/${catSlug}/${locSlug}` : `/${catSlug}`
}

export function parsePathname(pathname) {
  const parts = pathname.replace(/^\//, '').split('/').filter(Boolean)
  if (!parts[0]) return { cat: 'all', loc: null }
  const cat = SLUG_TO_CAT[parts[0]]
  if (cat) return { cat, loc: parts[1] ? slugToCity(parts[1]) : null }
  // Not a category slug — could be a city-only URL like /mumbai (all categories)
  const cityOnly = slugToCity(parts[0])
  return cityOnly ? { cat: 'all', loc: cityOnly } : { cat: 'all', loc: null }
}

export function slugify(text) {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i

// Clean, crawlable listing URL: /cars/hyderabad/2019-hyundai-creta-petrol-<uuid>
export function buildListingPath(listing) {
  const catSlug = CAT_TO_SLUG[listing.category] || 'all'
  const citySlug = listing.location ? cityToSlug(listing.location) : 'india'
  const titleSlug = slugify(listing.title) || 'listing'
  return `/${catSlug}/${citySlug}/${titleSlug}-${listing.id}`
}

// Pulls the listing UUID out of any pathname ending in one, regardless of the slug text before it
export function parseListingId(pathname) {
  const parts = pathname.replace(/^\//, '').split('/').filter(Boolean)
  const last = parts[parts.length - 1]
  if (!last) return null
  const match = last.match(UUID_RE)
  return match ? match[0] : null
}
