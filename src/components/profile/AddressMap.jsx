import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

// Vite bundles Leaflet's default marker images under a hash, breaking its relative-path lookup — point it at the imported assets instead.
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow })

const DEFAULT_CENTER = [20.5937, 78.9629] // India centroid
const DEFAULT_ZOOM = 5

export default function AddressMap({ lat, lng, onChange }) {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const markerRef = useRef(null)
  const onChangeRef = useRef(onChange)
  const [locating, setLocating] = useState(false)

  useEffect(() => { onChangeRef.current = onChange })

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return
    const hasPos = lat != null && lng != null
    const map = L.map(containerRef.current, { zoomControl: true })
      .setView(hasPos ? [lat, lng] : DEFAULT_CENTER, hasPos ? 15 : DEFAULT_ZOOM)

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    const marker = L.marker(hasPos ? [lat, lng] : DEFAULT_CENTER, { draggable: true }).addTo(map)
    marker.on('dragend', () => {
      const pos = marker.getLatLng()
      onChangeRef.current(pos.lat, pos.lng)
    })
    map.on('click', e => {
      marker.setLatLng(e.latlng)
      onChangeRef.current(e.latlng.lat, e.latlng.lng)
    })

    mapRef.current = map
    markerRef.current = marker

    return () => { map.remove(); mapRef.current = null; markerRef.current = null }
  }, [])

  // Sync marker/view when position changes externally (e.g. Locate Me, or editing an existing address)
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || lat == null || lng == null) return
    markerRef.current.setLatLng([lat, lng])
    mapRef.current.setView([lat, lng], 15)
  }, [lat, lng])

  function locateMe() {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => { onChangeRef.current(coords.latitude, coords.longitude); setLocating(false) },
      () => setLocating(false),
      { timeout: 12000 }
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <div ref={containerRef} style={{ height: 260, borderRadius: 12, overflow: 'hidden', border: '1.5px solid #e5e7eb' }} />
      <button
        type="button"
        onClick={locateMe}
        disabled={locating}
        style={{
          position: 'absolute', bottom: 10, right: 10, zIndex: 1000,
          background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8,
          padding: '7px 12px', fontSize: 12, fontWeight: 700, color: '#1a1a2e',
          cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="8" strokeOpacity=".3"/>
        </svg>
        {locating ? 'Locating…' : 'Locate Me'}
      </button>
    </div>
  )
}
