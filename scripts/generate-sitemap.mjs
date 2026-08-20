// Auto-generates robots.txt-referenced sitemaps at build time from live Supabase data.
// Run standalone with: node --env-file=.env scripts/generate-sitemap.mjs
import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'

const BASE_URL = 'https://www.bazaartrade.in'
const OUT_DIR = new URL('../public/', import.meta.url)
const LISTINGS_PER_FILE = 5000
const SOLD_VISIBLE_MS = 48 * 3600 * 1000

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — skipping sitemap generation')
  process.exit(0)
}
// No auth session needed for a one-off read-only script — disabling it avoids a
// lingering token-refresh timer that would otherwise keep the process alive forever.
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

// Mirrors src/utils/routing.js (kept in sync manually — plain JS, no JSX, safe to duplicate here)
const CAT_TO_SLUG = {
  vehicles: 'cars', bikes: 'bikes', mobiles: 'mobiles', electronics: 'electronics',
  property: 'property', furniture: 'furniture', fashion: 'fashion', books: 'books',
  sports: 'sports', pets: 'pets', gaming: 'gaming', services: 'services', kids: 'kids',
}
function cityToSlug(city) {
  return city.trim().toLowerCase().replace(/\s+/g, '-').replace(/^-+|-+$/g, '')
}
function slugify(text) {
  return (text || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80)
}
function isVisible(l) {
  if (l.badge !== 'Sold' || !l.sold_at) return true
  return (Date.now() - new Date(l.sold_at).getTime()) < SOLD_VISIBLE_MS
}
function urlTag(loc, lastmod, changefreq, priority) {
  return `  <url><loc>${loc}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}<changefreq>${changefreq}</changefreq><priority>${priority}</priority></url>`
}
function wrapUrlset(urls) {
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

async function main() {
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, title, category, location, created_at, badge, sold_at')
  if (error) {
    console.error('Failed to fetch listings for sitemap:', error.message)
    process.exitCode = 1
    return
  }
  const active = (listings || []).filter(isVisible)

  // ── sitemap-pages.xml — home + fixed category hubs + trust pages ──
  const pageUrls = [urlTag(`${BASE_URL}/`, null, 'daily', '1.0')]
  for (const slug of Object.values(CAT_TO_SLUG)) {
    pageUrls.push(urlTag(`${BASE_URL}/${slug}`, null, 'daily', '0.9'))
  }
  const TRUST_SLUGS = ['about', 'safety-tips', 'help', 'report-a-problem', 'community-guidelines', 'terms', 'privacy', 'cookie-policy', 'careers', 'press']
  for (const slug of TRUST_SLUGS) {
    pageUrls.push(urlTag(`${BASE_URL}/${slug}`, null, 'monthly', '0.4'))
  }
  // Curated top-city hubs (all categories) — linked from the homepage "Browse by City" block
  const TOP_CITIES = ['Hyderabad', 'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Kochi']
  for (const city of TOP_CITIES) {
    pageUrls.push(urlTag(`${BASE_URL}/${cityToSlug(city)}`, null, 'daily', '0.6'))
  }
  writeFileSync(new URL('sitemap-pages.xml', OUT_DIR), wrapUrlset(pageUrls))

  // ── sitemap-locations.xml — only category+city combos with real listings ──
  const combos = new Map()
  for (const l of active) {
    if (!l.location || !CAT_TO_SLUG[l.category]) continue
    const key = `${l.category}::${l.location}`
    combos.set(key, (combos.get(key) || 0) + 1)
  }
  const locUrls = [...combos.keys()].map(key => {
    const [category, location] = key.split('::')
    return urlTag(`${BASE_URL}/${CAT_TO_SLUG[category]}/${cityToSlug(location)}`, null, 'daily', '0.7')
  })
  writeFileSync(new URL('sitemap-locations.xml', OUT_DIR), wrapUrlset(locUrls))

  // ── sitemap-listings-N.xml — every active listing, chunked ──
  const listingUrls = active
    .filter(l => CAT_TO_SLUG[l.category] && l.location)
    .map(l => {
      const path = `/${CAT_TO_SLUG[l.category]}/${cityToSlug(l.location)}/${slugify(l.title) || 'listing'}-${l.id}`
      const lastmod = new Date(l.created_at).toISOString().slice(0, 10)
      return urlTag(`${BASE_URL}${path}`, lastmod, 'weekly', '0.6')
    })

  const chunks = []
  for (let i = 0; i < listingUrls.length; i += LISTINGS_PER_FILE) {
    chunks.push(listingUrls.slice(i, i + LISTINGS_PER_FILE))
  }
  if (chunks.length === 0) chunks.push([]) // always emit at least one file
  chunks.forEach((chunk, i) => {
    writeFileSync(new URL(`sitemap-listings-${i + 1}.xml`, OUT_DIR), wrapUrlset(chunk))
  })

  // ── sitemap.xml — index of the above ──
  const now = new Date().toISOString()
  const indexEntries = [
    `sitemap-pages.xml`,
    `sitemap-locations.xml`,
    ...chunks.map((_, i) => `sitemap-listings-${i + 1}.xml`),
  ].map(file => `  <sitemap><loc>${BASE_URL}/${file}</loc><lastmod>${now}</lastmod></sitemap>`)

  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${indexEntries.join('\n')}\n</sitemapindex>\n`
  writeFileSync(new URL('sitemap.xml', OUT_DIR), indexXml)

  console.log(`Sitemap generated: ${pageUrls.length} pages, ${locUrls.length} location pages, ${listingUrls.length} listings across ${chunks.length} file(s)`)
}

main()
