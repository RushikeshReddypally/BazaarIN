import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../context/AppContext'
import { states } from '../data/locations'

const NOMINATIM = 'https://nominatim.openstreetmap.org/reverse'

function findCityInData(name) {
  if (!name) return null
  const lc = name.toLowerCase().trim()
  for (const s of states) {
    for (const c of s.cities) {
      if (c.toLowerCase() === lc) return c
    }
  }
  for (const s of states) {
    for (const c of s.cities) {
      const cl = c.toLowerCase()
      if (cl.length >= 4 && lc.length >= 4 && (lc.includes(cl) || cl.includes(lc))) return c
    }
  }
  return null
}

export default function LocationPicker() {
  const { activeLocation, setActiveLocation } = useApp()
  const [open, setOpen] = useState(false)
  const [selectedState, setSelectedState] = useState(null)
  const [query, setQuery] = useState('')
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const [geoLocating, setGeoLocating] = useState(false)
  const [geoError, setGeoError] = useState('')
  const btnRef = useRef(null)
  const dropRef = useRef(null)

  useEffect(() => {
    function handleMouseDown(e) {
      const inBtn = btnRef.current?.contains(e.target)
      const inDrop = dropRef.current?.contains(e.target)
      if (!inBtn && !inDrop) close()
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  function close() {
    setOpen(false)
    setSelectedState(null)
    setQuery('')
    setGeoError('')
  }

  function toggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX })
    }
    setOpen(o => !o)
    setSelectedState(null)
    setQuery('')
    setGeoError('')
  }

  function selectCity(city) {
    setActiveLocation(city)
    close()
    setGeoLocating(false)
  }

  async function handleGeolocate(e) {
    e.stopPropagation()
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported by your browser.')
      return
    }
    setGeoLocating(true)
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
            selectCity(matched)
          } else {
            const raw = candidates.find(Boolean) || ''
            setGeoError(`Detected "${raw}" — not in our list. Search manually below.`)
            setGeoLocating(false)
          }
        } catch {
          setGeoError('Could not fetch location. Try searching manually.')
          setGeoLocating(false)
        }
      },
      (err) => {
        setGeoError(err.code === 1
          ? 'Location access denied. Search manually below.'
          : 'Could not get location. Try again or search manually.')
        setGeoLocating(false)
      },
      { timeout: 12000, maximumAge: 600000 }
    )
  }

  const searchResults = query.trim()
    ? states.flatMap(s =>
        s.cities
          .filter(c => c.toLowerCase().includes(query.toLowerCase()))
          .map(c => ({ city: c, state: s.state }))
      ).slice(0, 30)
    : null

  const cityList = selectedState
    ? (query.trim()
        ? selectedState.cities.filter(c => c.toLowerCase().includes(query.toLowerCase()))
        : selectedState.cities)
    : []

  return (
    <>
      <button ref={btnRef} className="nav-city" onClick={toggle}>
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path d="M12 2a7 7 0 0 1 7 7c0 5.25-7 13-7 13S5 14.25 5 9a7 7 0 0 1 7-7z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
        {activeLocation === 'all' ? 'All Cities' : activeLocation}
      </button>

      {open && createPortal(
        <div
          ref={dropRef}
          style={{
            position: 'absolute', top: pos.top, left: pos.left,
            background: '#fff', borderRadius: 14, border: '1.5px solid #e8e4f0',
            boxShadow: '0 8px 32px rgba(74,78,105,0.18)',
            width: 290, zIndex: 9999, overflow: 'hidden',
          }}
        >
          {/* ── Use my location ── */}
          <div
            onClick={handleGeolocate}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 14px', cursor: geoLocating ? 'default' : 'pointer',
              borderBottom: '1px solid #f0edf7',
              background: '#f9f7ff',
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => { if (!geoLocating) e.currentTarget.style.background = '#f0edf7' }}
            onMouseLeave={e => e.currentTarget.style.background = '#f9f7ff'}
          >
            {geoLocating ? (
              <div style={{
                width: 16, height: 16, border: '2px solid #c9b8f0',
                borderTopColor: '#4a4e69', borderRadius: '50%',
                animation: 'spin 0.7s linear infinite', flexShrink: 0,
              }} />
            ) : (
              <svg width="16" height="16" fill="none" stroke="#4a4e69" strokeWidth="2.2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
                <circle cx="12" cy="12" r="8" strokeOpacity=".25"/>
              </svg>
            )}
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#22223b' }}>
                {geoLocating ? 'Detecting your location…' : 'Use my location'}
              </div>
              {!geoLocating && (
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>
                  Auto-detect via GPS
                </div>
              )}
            </div>
          </div>

          {/* ── Geo error ── */}
          {geoError && (
            <div style={{ padding: '8px 14px', background: '#fff7ed', fontSize: 12, color: '#92400e', borderBottom: '1px solid #fed7aa' }}>
              {geoError}
            </div>
          )}

          {/* ── Search ── */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #f0edf7' }}>
            <input
              autoFocus
              value={query}
              onChange={e => { setQuery(e.target.value); setSelectedState(null) }}
              placeholder={selectedState ? `Search in ${selectedState.state}…` : 'Search any city…'}
              style={{
                width: '100%', border: '1.5px solid #e8e4f0', borderRadius: 8,
                padding: '7px 10px', fontSize: 13, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ maxHeight: 300, overflowY: 'auto', padding: '4px 0' }}>

            {/* All Cities */}
            {!selectedState && !query && (
              <div
                onClick={() => selectCity('all')}
                style={{
                  padding: '9px 16px', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                  color: activeLocation === 'all' ? '#4a4e69' : '#555',
                  background: activeLocation === 'all' ? '#f5f3ff' : 'transparent',
                  borderBottom: '1px solid #f5f3f9',
                }}
              >
                All Cities
              </div>
            )}

            {/* Search results */}
            {query && !selectedState && searchResults?.map(({ city, state }) => (
              <div
                key={`${state}-${city}`}
                onClick={() => selectCity(city)}
                style={{
                  padding: '8px 16px', cursor: 'pointer', fontSize: 13,
                  background: activeLocation === city ? '#f5f3ff' : 'transparent',
                  fontWeight: activeLocation === city ? 700 : 400,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9f7ff'}
                onMouseLeave={e => e.currentTarget.style.background = activeLocation === city ? '#f5f3ff' : 'transparent'}
              >
                <span>{city}</span>
                <span style={{ color: '#aaa', fontSize: 11 }}>{state}</span>
              </div>
            ))}

            {/* Back to state list */}
            {selectedState && (
              <div
                onClick={() => { setSelectedState(null); setQuery('') }}
                style={{
                  padding: '8px 16px', cursor: 'pointer', fontSize: 13,
                  fontWeight: 700, color: '#4a4e69', display: 'flex',
                  alignItems: 'center', gap: 6, borderBottom: '1px solid #f0edf7',
                  background: '#f9f7ff',
                }}
              >
                ← {selectedState.state}
              </div>
            )}

            {/* State list */}
            {!selectedState && !query && states.map(s => (
              <div
                key={s.state}
                onClick={() => setSelectedState(s)}
                style={{
                  padding: '9px 16px', cursor: 'pointer', fontSize: 13,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <span>{s.state}</span>
                <span style={{ color: '#aaa', fontSize: 11 }}>{s.cities.length} →</span>
              </div>
            ))}

            {/* City list */}
            {selectedState && cityList.map(city => (
              <div
                key={city}
                onClick={() => selectCity(city)}
                style={{
                  padding: '8px 20px', cursor: 'pointer', fontSize: 13,
                  background: activeLocation === city ? '#f5f3ff' : 'transparent',
                  fontWeight: activeLocation === city ? 700 : 400,
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#f9f7ff'}
                onMouseLeave={e => e.currentTarget.style.background = activeLocation === city ? '#f5f3ff' : 'transparent'}
              >
                {city}
              </div>
            ))}

          </div>

          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>,
        document.body
      )}
    </>
  )
}
