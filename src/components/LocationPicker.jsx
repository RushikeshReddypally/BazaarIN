import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useApp } from '../context/AppContext'
import { states } from '../data/locations'

export default function LocationPicker() {
  const { activeLocation, setActiveLocation } = useApp()
  const [open, setOpen] = useState(false)
  const [selectedState, setSelectedState] = useState(null)
  const [query, setQuery] = useState('')
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const btnRef = useRef(null)
  const dropRef = useRef(null)

  useEffect(() => {
    function handleMouseDown(e) {
      const inBtn = btnRef.current?.contains(e.target)
      const inDrop = dropRef.current?.contains(e.target)
      if (!inBtn && !inDrop) {
        setOpen(false)
        setSelectedState(null)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', handleMouseDown)
    return () => document.removeEventListener('mousedown', handleMouseDown)
  }, [])

  function toggle() {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      setPos({ top: rect.bottom + window.scrollY + 8, left: rect.left + window.scrollX })
    }
    setOpen(o => !o)
    setSelectedState(null)
    setQuery('')
  }

  function selectCity(city) {
    setActiveLocation(city)
    setOpen(false)
    setSelectedState(null)
    setQuery('')
  }

  const searchResults = query.trim()
    ? states.flatMap(s =>
        s.cities
          .filter(c => c.toLowerCase().includes(query.toLowerCase()))
          .map(c => ({ city: c, state: s.state, icon: s.icon }))
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
            width: 280, zIndex: 9999, overflow: 'hidden',
          }}
        >
          {/* Search */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid #f0edf7' }}>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={selectedState ? `Search in ${selectedState.state}…` : 'Search any city…'}
              style={{
                width: '100%', border: '1.5px solid #e8e4f0', borderRadius: 8,
                padding: '7px 10px', fontSize: 13, outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ maxHeight: 340, overflowY: 'auto', padding: '6px 0' }}>

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
                🌏 All Cities
              </div>
            )}

            {/* Search results across all states */}
            {query && !selectedState && searchResults?.map(({ city, state, icon }) => (
              <div
                key={`${state}-${city}`}
                onClick={() => selectCity(city)}
                style={{
                  padding: '8px 16px', cursor: 'pointer', fontSize: 13,
                  background: activeLocation === city ? '#f5f3ff' : 'transparent',
                  fontWeight: activeLocation === city ? 700 : 400,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <span>{city}</span>
                <span style={{ color: '#aaa', fontSize: 11 }}>{icon} {state}</span>
              </div>
            ))}

            {/* Back button */}
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
                ← {selectedState.icon} {selectedState.state}
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
              >
                <span>{s.icon} {s.state}</span>
                <span style={{ color: '#aaa', fontSize: 11 }}>{s.cities.length} →</span>
              </div>
            ))}

            {/* City list after selecting state */}
            {selectedState && cityList.map(city => (
              <div
                key={city}
                onClick={() => selectCity(city)}
                style={{
                  padding: '8px 20px', cursor: 'pointer', fontSize: 13,
                  background: activeLocation === city ? '#f5f3ff' : 'transparent',
                  fontWeight: activeLocation === city ? 700 : 400,
                }}
              >
                {city}
              </div>
            ))}

          </div>
        </div>,
        document.body
      )}
    </>
  )
}
