import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { states } from '../data/locations'

const NOMINATIM = 'https://nominatim.openstreetmap.org/reverse'

function findCityInData(nameFromGeo) {
  if (!nameFromGeo) return null
  const lc = nameFromGeo.toLowerCase().trim()
  for (const s of states) {
    for (const city of s.cities) {
      if (city.toLowerCase() === lc) return city
    }
  }
  // Partial match — city name contains our known city or vice versa
  for (const s of states) {
    for (const city of s.cities) {
      const cl = city.toLowerCase()
      if (lc.includes(cl) || cl.includes(lc)) return city
    }
  }
  return null
}

export default function WelcomeModal() {
  const { welcomeOpen, setWelcomeOpen, setActiveLocation, restoringListing } = useApp()
  const [step, setStep] = useState('home') // 'home' | 'locating' | 'manual'
  const [geoError, setGeoError] = useState('')
  const [selectedState, setSelectedState] = useState(null)
  const [query, setQuery] = useState('')

  if (!welcomeOpen || restoringListing) return null

  function pick(city) {
    setActiveLocation(city)
    setWelcomeOpen(false)
  }

  function skip() {
    setActiveLocation('all')
    setWelcomeOpen(false)
  }

  async function handleGeolocate() {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.')
      return
    }
    setStep('locating')
    setGeoError('')
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(
            `${NOMINATIM}?lat=${latitude}&lon=${longitude}&format=json&zoom=10`,
            { headers: { 'Accept-Language': 'en-IN,en', 'User-Agent': 'BazaarTrade/1.0' } }
          )
          const data = await res.json()
          const a = data.address || {}
          const candidates = [a.city, a.town, a.municipality, a.village, a.suburb, a.county]
          let matched = null
          for (const name of candidates) {
            matched = findCityInData(name)
            if (matched) break
          }
          if (matched) {
            pick(matched)
          } else {
            const rawName = candidates.find(Boolean) || ''
            setGeoError(`We detected "${rawName}" but it's not in our city list. Please choose manually.`)
            setStep('manual')
          }
        } catch {
          setGeoError('Could not fetch location details. Please choose your city below.')
          setStep('manual')
        }
      },
      (err) => {
        const msg = err.code === 1
          ? 'Location access was denied. Please choose your city manually.'
          : 'Could not get your location. Please choose manually.'
        setGeoError(msg)
        setStep('manual')
      },
      { timeout: 12000, maximumAge: 600000 }
    )
  }

  // Manual picker state
  const searchResults = query.trim().length >= 2
    ? states.flatMap(s =>
        s.cities
          .filter(c => c.toLowerCase().includes(query.toLowerCase()))
          .map(c => ({ city: c, state: s.state }))
      ).slice(0, 20)
    : null

  const cityList = selectedState
    ? selectedState.cities.filter(c =>
        !query || c.toLowerCase().includes(query.toLowerCase())
      )
    : []

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 2000,
      background: 'rgba(15,15,30,0.72)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
      backdropFilter: 'blur(3px)',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 20,
        width: '100%',
        maxWidth: step === 'manual' ? 520 : 440,
        boxShadow: '0 32px 80px rgba(0,0,0,0.28)',
        overflow: 'hidden',
        animation: 'wm-in 0.28s cubic-bezier(.34,1.56,.64,1)',
      }}>
        <style>{`
          @keyframes wm-in { from { opacity:0; transform:scale(0.88) translateY(18px) } to { opacity:1; transform:none } }
        `}</style>

        {/* Header band */}
        <div style={{
          background: 'linear-gradient(135deg,#1a1a2e 0%,#2d3561 100%)',
          padding: '28px 28px 24px',
          textAlign: 'center',
          position: 'relative',
        }}>
          {/* India pin icon */}
          <div style={{ fontSize: 36, marginBottom: 10 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style={{ display: 'inline-block' }}>
              <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z" fill="#e8473f" stroke="none"/>
              <circle cx="12" cy="9" r="2.5" fill="#fff"/>
            </svg>
          </div>
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 800, lineHeight: 1.3, margin: 0 }}>
            {step === 'manual' ? 'Choose your city' : 'Welcome to BazaarTrade.in'}
          </h2>
          {step !== 'manual' && (
            <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13.5, marginTop: 8, lineHeight: 1.5 }}>
              Start buying or selling anything,<br />anywhere across India
            </p>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: step === 'manual' ? '0' : '28px 28px 20px' }}>

          {/* ── Home / Locating step ── */}
          {(step === 'home' || step === 'locating') && (
            <>
              <p style={{ textAlign: 'center', color: '#4b5563', fontSize: 14, marginBottom: 22, lineHeight: 1.6 }}>
                To show you listings near you, we need to know your location.
              </p>

              {geoError && (
                <div style={{
                  background: '#fff7ed', border: '1px solid #fed7aa',
                  borderRadius: 10, padding: '10px 14px',
                  fontSize: 12.5, color: '#92400e', marginBottom: 16, lineHeight: 1.5,
                }}>
                  {geoError}
                </div>
              )}

              {/* Use my location CTA */}
              <button
                onClick={handleGeolocate}
                disabled={step === 'locating'}
                style={{
                  width: '100%', padding: '14px 0',
                  background: step === 'locating' ? '#374151' : '#1a1a2e',
                  color: '#fff', borderRadius: 12, fontSize: 15, fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                  marginBottom: 12, transition: 'background 0.18s',
                  opacity: step === 'locating' ? 0.8 : 1,
                }}
              >
                {step === 'locating' ? (
                  <>
                    <div style={{
                      width: 16, height: 16, border: '2.5px solid rgba(255,255,255,0.3)',
                      borderTopColor: '#fff', borderRadius: '50%',
                      animation: 'spin 0.7s linear infinite', flexShrink: 0,
                    }} />
                    Detecting your location…
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                      <circle cx="12" cy="12" r="8" strokeOpacity=".3"/>
                    </svg>
                    Use my location
                  </>
                )}
              </button>

              {/* Manual choose button */}
              <button
                onClick={() => setStep('manual')}
                style={{
                  width: '100%', padding: '13px 0',
                  background: 'transparent', border: '1.5px solid #e5e7eb',
                  color: '#374151', borderRadius: 12, fontSize: 14.5, fontWeight: 600,
                  marginBottom: 20, transition: 'border-color 0.18s, background 0.18s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#9ca3af'; e.currentTarget.style.background = '#f9fafb' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e7eb'; e.currentTarget.style.background = 'transparent' }}
              >
                Choose my city manually
              </button>

              {/* Skip */}
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={skip}
                  style={{ fontSize: 12.5, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Skip — browse all listings across India
                </button>
              </div>
            </>
          )}

          {/* ── Manual picker step ── */}
          {step === 'manual' && (
            <>
              {geoError && (
                <div style={{
                  background: '#fff7ed', border: '1px solid #fed7aa',
                  fontSize: 12.5, color: '#92400e', padding: '10px 20px',
                  lineHeight: 1.5,
                }}>
                  {geoError}
                </div>
              )}

              {/* Search */}
              <div style={{ padding: '14px 20px 10px', borderBottom: '1px solid #f3f4f6' }}>
                <div style={{ position: 'relative' }}>
                  <svg style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }}
                    width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                  </svg>
                  <input
                    autoFocus
                    value={query}
                    onChange={e => { setQuery(e.target.value); setSelectedState(null) }}
                    placeholder={selectedState ? `Search in ${selectedState.state}…` : 'Search any city…'}
                    style={{
                      width: '100%', border: '1.5px solid #e8e4f0', borderRadius: 10,
                      padding: '9px 10px 9px 34px', fontSize: 13.5, outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  {query && (
                    <button
                      onClick={() => { setQuery(''); setSelectedState(null) }}
                      style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', fontSize: 14 }}
                    >✕</button>
                  )}
                </div>
              </div>

              {/* List */}
              <div style={{ maxHeight: 320, overflowY: 'auto', padding: '4px 0' }}>

                {/* Back */}
                {selectedState && !query && (
                  <div
                    onClick={() => setSelectedState(null)}
                    style={{
                      padding: '10px 20px', cursor: 'pointer', fontSize: 13, fontWeight: 700,
                      color: '#1d3a6e', borderBottom: '1px solid #f0edf7',
                      background: '#f9f7ff', display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    ← {selectedState.state}
                  </div>
                )}

                {/* Global search results */}
                {searchResults && searchResults.map(({ city, state }) => (
                  <div
                    key={`${state}-${city}`}
                    onClick={() => pick(city)}
                    style={{
                      padding: '9px 20px', cursor: 'pointer', fontSize: 13.5,
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      borderBottom: '1px solid #f9f9f9',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f5f3ff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ fontWeight: 500 }}>{city}</span>
                    <span style={{ color: '#9ca3af', fontSize: 11.5 }}>{state}</span>
                  </div>
                ))}

                {/* State list */}
                {!selectedState && !query && states.map(s => (
                  <div
                    key={s.state}
                    onClick={() => setSelectedState(s)}
                    style={{
                      padding: '10px 20px', cursor: 'pointer', fontSize: 13.5,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      borderBottom: '1px solid #f9f9f9',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>{s.state}</span>
                    <span style={{ color: '#9ca3af', fontSize: 12 }}>{s.cities.length} cities →</span>
                  </div>
                ))}

                {/* City list */}
                {selectedState && !searchResults && cityList.map(city => (
                  <div
                    key={city}
                    onClick={() => pick(city)}
                    style={{
                      padding: '9px 28px', cursor: 'pointer', fontSize: 13.5,
                      borderBottom: '1px solid #f9f9f9',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f5f3ff'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {city}
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div style={{
                borderTop: '1px solid #f3f4f6', padding: '12px 20px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <button
                  onClick={() => { setStep('home'); setQuery(''); setSelectedState(null) }}
                  style={{ fontSize: 13, color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
                >
                  ← Back
                </button>
                <button
                  onClick={skip}
                  style={{ fontSize: 12.5, color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Browse all India
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
