import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { categories } from '../data/categories'

const emptyForm = { title: '', category: '', price: '', location: '', description: '' }

export default function PostAdModal() {
  const { postOpen, setPostOpen, showToast } = useApp()
  const [form, setForm] = useState(emptyForm)

  function set(key) {
    return e => setForm(f => ({ ...f, [key]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    setPostOpen(false)
    setForm(emptyForm)
    showToast('Ad posted! Going live shortly 🎉', '✓')
  }

  function close() { setPostOpen(false) }

  return (
    <div className={`overlay${postOpen ? ' open' : ''}`} onClick={e => e.target === e.currentTarget && close()}>
      <div className="modal modal-wide">
        <button className="modal-x" onClick={close}>✕</button>

        <div className="modal-logo">Post a Free Ad</div>
        <p className="modal-sub">Reach millions of buyers across India — it's completely free!</p>

        <div className="photo-upload" onClick={() => showToast('Photo upload coming soon!', '📸')}>
          <div className="pu-icon">📷</div>
          <div className="pu-text">Add Photos</div>
          <div className="pu-sub">Up to 10 photos · JPG, PNG · Max 5MB each</div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="fr-row">
            <div className="fr">
              <label>Ad Title</label>
              <input value={form.title} onChange={set('title')} placeholder="e.g. iPhone 14 Pro 256GB" required />
            </div>
            <div className="fr">
              <label>Category</label>
              <select value={form.category} onChange={set('category')} required>
                <option value="">Select category</option>
                {categories.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="fr-row">
            <div className="fr">
              <label>Price (₹)</label>
              <input type="number" value={form.price} onChange={set('price')} placeholder="0" min="0" required />
            </div>
            <div className="fr">
              <label>Location</label>
              <input value={form.location} onChange={set('location')} placeholder="e.g. Andheri West, Mumbai" required />
            </div>
          </div>

          <div className="fr">
            <label>Description</label>
            <textarea value={form.description} onChange={set('description')} placeholder="Describe your item in detail…" required />
          </div>

          <button type="submit" className="fr-submit">
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M12 5v14M5 12h14" />
            </svg>
            Post Ad for Free
          </button>
        </form>
      </div>
    </div>
  )
}
