import { useApp } from '../context/AppContext'
import { locations } from '../data/locations'

export default function Locations() {
  const { showToast } = useApp()

  return (
    <section id="locations" className="section">
      <div className="container">
        <div className="sec-head reveal">
          <h2 className="sec-h"><small>Near you</small>Browse by City</h2>
          <a href="#" className="sec-link">
            All cities
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </a>
        </div>

        <div className="locations-grid reveal reveal-d1">
          {locations.map(loc => (
            <div
              key={loc.city}
              className="loc-card"
              onClick={() => showToast(`Browsing listings in ${loc.city}`, loc.icon)}
            >
              <div className="loc-icon">{loc.icon}</div>
              <div className="loc-city">{loc.city}</div>
              <div className="loc-count">{loc.count}</div>
              <div className="loc-state">{loc.state}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
