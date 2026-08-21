import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const STEPS = [
  { key: 'aadhaar', title: 'Aadhaar Card', hint: 'Frame your Aadhaar card clearly and take a photo', facingMode: 'environment' },
  { key: 'selfie', title: 'Selfie', hint: 'Look at the camera so we can match it to your ID', facingMode: 'user' },
]

export default function VerificationRequestModal({ user, onClose, onSubmit, showToast }) {
  const [step, setStep] = useState(0)
  const [files, setFiles] = useState({ aadhaar: null, selfie: null })
  const [previews, setPreviews] = useState({ aadhaar: null, selfie: null })
  const [uploading, setUploading] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState(null)
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const inputRef = useRef(null)

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1
  const hasPhoto = !!previews[current.key]

  function stopCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCameraActive(false)
  }

  // Start the live camera for the current step, unless a photo's already been taken
  useEffect(() => {
    if (hasPhoto) return
    let cancelled = false
    setCameraError(null)

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera not supported in this browser')
      return
    }

    navigator.mediaDevices.getUserMedia({ video: { facingMode: current.facingMode } })
      .then(stream => {
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return }
        streamRef.current = stream
        if (videoRef.current) videoRef.current.srcObject = stream
        setCameraActive(true)
      })
      .catch(err => { if (!cancelled) setCameraError(err.message || 'Camera access denied') })

    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
  }, [step, hasPhoto, current.facingMode])

  useEffect(() => () => stopCamera(), [])

  function capturePhoto() {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0)
    canvas.toBlob(blob => {
      if (!blob) return
      const file = new File([blob], `${current.key}.jpg`, { type: 'image/jpeg' })
      setFiles(f => ({ ...f, [current.key]: file }))
      setPreviews(p => ({ ...p, [current.key]: URL.createObjectURL(blob) }))
      stopCamera()
    }, 'image/jpeg', 0.92)
  }

  function handleFile(e) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    stopCamera()
    setFiles(f => ({ ...f, [current.key]: file }))
    setPreviews(p => ({ ...p, [current.key]: URL.createObjectURL(file) }))
  }

  function retake() {
    setFiles(f => ({ ...f, [current.key]: null }))
    setPreviews(p => ({ ...p, [current.key]: null }))
  }

  async function handleNext() {
    if (!isLast) { setStep(s => s + 1); return }
    await handleSubmit()
  }

  async function handleSubmit() {
    setUploading(true)
    try {
      const uploaded = {}
      for (const { key } of STEPS) {
        const file = files[key]
        const ext = file.name.split('.').pop() || 'jpg'
        const path = `${user.id}/${key}_${Date.now()}.${ext}`
        const { error } = await supabase.storage.from('verification-docs').upload(path, file)
        if (error) throw error
        uploaded[key] = path
      }
      await onSubmit({ aadhaar_photo_path: uploaded.aadhaar, selfie_photo_path: uploaded.selfie })
      onClose()
    } catch (err) {
      showToast(err.message || 'Upload failed — try again', '✕')
    }
    setUploading(false)
  }

  function handleClose() {
    stopCamera()
    onClose()
  }

  return (
    <div className="overlay open" style={{ zIndex: 1400 }} onClick={e => e.target === e.currentTarget && handleClose()}>
      <div className="modal" style={{ maxWidth: 420 }}>
        <button className="modal-x" onClick={handleClose}>✕</button>

        {/* Progress bar */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
          {STEPS.map((s, i) => (
            <div key={s.key} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= step ? '#1a1a2e' : '#e5e7eb' }} />
          ))}
        </div>

        <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px' }}>
          Step {step + 1} of {STEPS.length}: {current.title}
        </h3>
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>{current.hint}</p>

        <div style={{
          borderRadius: 14, border: '1.5px solid #e5e7eb', background: '#111',
          height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', marginBottom: 14, position: 'relative',
        }}>
          {hasPhoto ? (
            <img src={previews[current.key]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : cameraActive ? (
            <>
              <video
                ref={videoRef} autoPlay playsInline muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: current.facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
              />
              <button
                onClick={capturePhoto}
                aria-label="Capture photo"
                style={{
                  position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
                  width: 56, height: 56, borderRadius: '50%', background: '#fff',
                  border: '4px solid rgba(255,255,255,0.5)', cursor: 'pointer', padding: 0,
                }}
              />
            </>
          ) : cameraError ? (
            <div style={{ textAlign: 'center', color: '#f3f4f6', padding: 20 }}>
              <svg width="34" height="34" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom: 8, opacity: 0.7 }}>
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              <div style={{ fontSize: 12.5, opacity: 0.85 }}>Camera unavailable — upload a photo instead</div>
            </div>
          ) : (
            <div style={{ color: '#9ca3af', fontSize: 12.5 }}>Starting camera…</div>
          )}
        </div>

        <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />

        {!hasPhoto ? (
          <button
            onClick={() => inputRef.current?.click()}
            style={{ width: '100%', padding: '11px', borderRadius: 99, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', cursor: 'pointer', fontSize: 13, fontWeight: 600, marginBottom: 10 }}
          >
            {cameraActive ? 'Or upload a photo instead' : 'Upload a photo'}
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <button
              onClick={retake}
              style={{ flex: 1, padding: '12px', borderRadius: 99, border: '1.5px solid #e5e7eb', background: '#fff', color: '#374151', cursor: 'pointer', fontSize: 13.5, fontWeight: 600 }}
            >
              Retake
            </button>
            <button
              onClick={handleNext} disabled={uploading}
              style={{ flex: 2, padding: '12px', borderRadius: 99, border: 'none', background: '#1a1a2e', color: '#fff', cursor: 'pointer', fontSize: 13.5, fontWeight: 700 }}
            >
              {uploading ? 'Submitting…' : isLast ? 'Submit for Review' : 'Next →'}
            </button>
          </div>
        )}

        <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
          Your ID stays private — only visible to our verification team, never shown to other users.
        </p>
      </div>
    </div>
  )
}
