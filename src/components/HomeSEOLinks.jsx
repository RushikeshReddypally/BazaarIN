import { useApp } from '../context/AppContext'
import { categories } from '../data/categories.jsx'
import { CAT_TO_SLUG, cityToSlug } from '../utils/routing'

const TOP_CITIES = ['Hyderabad', 'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Kochi']

const POPULAR_SEARCHES = [
  { label: 'Used Cars', cat: 'vehicles' },
  { label: 'Used Mobiles', cat: 'mobiles' },
  { label: 'Used Bikes', cat: 'bikes' },
  { label: 'Flats for Rent', cat: 'property' },
  { label: 'Second-Hand Furniture', cat: 'furniture' },
  { label: 'Used Laptops', cat: 'electronics' },
]

export default function HomeSEOLinks() {
  const { setActiveCategory, setActiveLocation } = useApp()

  function goCategory(e, catId) {
    e.preventDefault()
    setActiveCategory(catId)
    document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' })
  }

  function goCity(e, city) {
    e.preventDefault()
    setActiveCategory('all')
    setActiveLocation(city)
    document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' })
  }

  const realCategories = categories.filter(c => c.id !== 'all')

  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="container" style={{ maxWidth: 1200 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>

          <div>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--indigo)', marginBottom: 14 }}>Popular Categories</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {realCategories.map(c => (
                <a
                  key={c.id}
                  href={`/${CAT_TO_SLUG[c.id] || ''}`}
                  onClick={e => goCategory(e, c.id)}
                  style={{ fontSize: 13.5, color: 'var(--grape)', textDecoration: 'none' }}
                >
                  {c.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--indigo)', marginBottom: 14 }}>Browse by City</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {TOP_CITIES.map(city => (
                <a
                  key={city}
                  href={`/${cityToSlug(city)}`}
                  onClick={e => goCity(e, city)}
                  style={{ fontSize: 13.5, color: 'var(--grape)', textDecoration: 'none' }}
                >
                  {city}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: 'var(--indigo)', marginBottom: 14 }}>Popular Searches</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {POPULAR_SEARCHES.map(s => (
                <a
                  key={s.label}
                  href={`/${CAT_TO_SLUG[s.cat] || ''}`}
                  onClick={e => goCategory(e, s.cat)}
                  style={{ fontSize: 13.5, color: 'var(--grape)', textDecoration: 'none' }}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
