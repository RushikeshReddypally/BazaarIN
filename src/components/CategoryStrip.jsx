import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'
import { categories, categoryIcons } from '../data/categories.jsx'

// Same 48h grace period Listings.jsx uses to hide expired "Sold" ads
const SOLD_VISIBLE_MS = 48 * 3600 * 1000
function isVisible(l) {
  if (l.badge !== 'Sold' || !l.sold_at) return true
  return (Date.now() - new Date(l.sold_at).getTime()) < SOLD_VISIBLE_MS
}

export default function CategoryStrip() {
  const { activeCategory, setActiveCategory } = useApp()
  const [counts, setCounts] = useState({})

  useEffect(() => {
    async function fetchCounts() {
      const { data, error } = await supabase.from('listings').select('category, badge, sold_at')
      if (error || !data) return
      const visible = data.filter(isVisible)
      const next = { all: visible.length }
      for (const l of visible) next[l.category] = (next[l.category] || 0) + 1
      setCounts(next)
    }
    fetchCounts()

    const channel = supabase
      .channel('category-counts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'listings' }, fetchCounts)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <section id="categories">
      <div className="cats-scroll">
        {categories.map(cat => {
          const Icon = categoryIcons[cat.id]
          return (
            <div
              key={cat.id}
              className={`cat-chip${activeCategory === cat.id ? ' active' : ''}`}
              onClick={() => {
                setActiveCategory(cat.id)
                document.getElementById('listings')?.scrollIntoView({ behavior: 'smooth' })
              }}
            >
              <Icon size={18} className="cat-e" />
              <span className="cat-n">{cat.label}</span>
              <span className="cat-c">
                {(counts[cat.id] ?? 0).toLocaleString('en-IN')}{cat.id === 'all' ? ' ads' : ''}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
