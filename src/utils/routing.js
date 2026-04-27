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
  return city.toLowerCase().replace(/\s+/g, '-')
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
  if (!catSlug) return '/'
  return locSlug ? `/${catSlug}/${locSlug}` : `/${catSlug}`
}

export function parsePathname(pathname) {
  const parts = pathname.replace(/^\//, '').split('/').filter(Boolean)
  const cat = SLUG_TO_CAT[parts[0]] || 'all'
  const loc = parts[1] ? slugToCity(parts[1]) : null
  return { cat, loc }
}
