import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { listings } from '../data/listings'
import ListingCard from './ListingCard'

const FILTERS = ['All', 'Vehicles', 'Electronics', 'Property', 'Furniture']

const FILTER_CATS = {
  Vehicles:    ['vehicles', 'bikes'],
  Electronics: ['electronics', 'mobiles', 'gaming'],
  Property:    ['property'],
  Furniture:   ['furniture'],
}

export default function Listings() {
  const { activeCategory, showToast } = useApp()
  const [activeFilter, setActiveFilter] = useState('All')
  const [sort, setSort] = useState('newest')

  const filtered = useMemo(() => {
    let list = [...listings]

    if (activeCategory !== 'all') {
      list = list.filter(l => l.category === activeCategory)
    }

    if (activeFilter !== 'All') {
      const cats = FILTER_CATS[activeFilter] ?? []
      list = list.filter(l => cats.includes(l.category))
    }

    if (sort === 'price-asc')  list.sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') list.sort((a, b) => b.price - a.price)

    return list
  }, [activeCategory, activeFilter, sort])

  return (
    <section id="listings" className="section">
      <div className="container">
        <div className="sec-head reveal">
          <h2 className="sec-h">
            <small>Fresh near you</small>Latest Listings
          </h2>
          <a href="#" className="sec-link">
            View all
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </a>
        </div>

        <div className="listings-bar reveal reveal-d1">
          {FILTERS.map(f => (
            <button
              key={f}
              className={`filter-pill${activeFilter === f ? ' on' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
          <button className="filter-pill" onClick={() => showToast('Advanced filters coming soon!', '🔧')}>
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            Filters
          </button>
          <div className="sort-wrap">
            <select className="sort-select" value={sort} onChange={e => setSort(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            <svg className="sort-arrow" width="12" height="12" fill="none" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </div>
        </div>

        <div className="lg reveal reveal-d2">
          {filtered.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: 'var(--lilac)', fontSize: 15 }}>
              No listings in this category yet.
            </div>
          ) : (
            filtered.map(l => <ListingCard key={l.id} listing={l} />)
          )}
        </div>

        <div className="load-more reveal reveal-d3">
          <button
            className="btn btn-ghost"
            style={{ fontSize: 15, padding: '13px 36px' }}
            onClick={() => showToast('Loading more listings…', '⏳')}
          >
            Load More
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
