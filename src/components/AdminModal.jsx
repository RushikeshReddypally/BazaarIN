import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { supabase } from '../lib/supabase'
import { formatPrice } from '../utils/format'
import { categories } from '../data/categories.jsx'

/* ── SEO preview helper ───────────────────────────────── */
const SITE_URL = 'https://baazartrade.in'

export default function AdminModal() {
  const { adminOpen, setAdminOpen, isAdminUser, isSEOUser } = useApp()
  const [tab, setTab] = useState(() => isSEOUser && !isAdminUser ? 'seo' : 'dashboard')

  if (!adminOpen || (!isAdminUser && !isSEOUser)) return null

  const allTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'listings', label: 'Listings', icon: '📋' },
    { id: 'verify', label: 'Verify', icon: '✅' },
    { id: 'blog', label: 'Blog', icon: '✍️' },
    { id: 'seo', label: 'SEO', icon: '🔍' },
    { id: 'sql', label: 'SQL Setup', icon: '⚙️' },
  ]
  const visibleTabs = isAdminUser ? allTabs : allTabs.filter(t => t.id === 'seo')

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 2100, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && setAdminOpen(false)}
    >
      <div style={{ background: '#f8f9fb', borderRadius: 16, width: '100%', maxWidth: 980, height: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.3)' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg,#1a1a2e,#2d3561)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </div>
            <div>
              <div style={{ color: '#fff', fontSize: 16, fontWeight: 800 }}>{isAdminUser ? 'Admin Panel' : 'SEO Panel'}</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>BazaarTrade.in Management Console</div>
            </div>
          </div>
          <button onClick={() => setAdminOpen(false)} style={{ color: 'rgba(255,255,255,0.6)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: '#fff', borderBottom: '1px solid #e5e7eb', flexShrink: 0 }}>
          {visibleTabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding: '12px 20px', border: 'none', background: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: tab === t.id ? 700 : 500,
                color: tab === t.id ? '#1d3a6e' : '#6b7280',
                borderBottom: tab === t.id ? '2px solid #1d3a6e' : '2px solid transparent',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <span>{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {tab === 'dashboard' && <DashboardTab />}
          {tab === 'listings' && <ListingsTab />}
          {tab === 'verify' && <VerifyTab />}
          {tab === 'blog' && <BlogTab />}
          {tab === 'seo' && <SEOTab />}
          {tab === 'sql' && <SQLTab />}
        </div>
      </div>
    </div>
  )
}

/* ── Dashboard ─────────────────────────────────────────── */
function DashboardTab() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [{ data: all, count }, { data: recentData }] = await Promise.all([
        supabase.from('listings').select('category, created_at', { count: 'exact' }),
        supabase.from('listings').select('id, title, category, price, seller_name, created_at, images').order('created_at', { ascending: false }).limit(8),
      ])
      const byCat = {}
      all?.forEach(l => { byCat[l.category] = (byCat[l.category] || 0) + 1 })
      const sellers = new Set(all?.map(l => l.seller_name)).size
      setStats({ total: count || 0, byCat, sellers })
      setRecent(recentData || [])
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <Loader />

  const topCats = Object.entries(stats.byCat).sort((a, b) => b[1] - a[1]).slice(0, 6)

  return (
    <div style={{ padding: 24 }}>
      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard icon="📦" label="Total Listings" value={stats.total.toLocaleString('en-IN')} color="#1d3a6e" />
        <StatCard icon="👥" label="Unique Sellers" value={stats.sellers.toLocaleString('en-IN')} color="#059669" />
        <StatCard icon="🏷️" label="Categories Active" value={Object.keys(stats.byCat).length} color="#7c3aed" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Category breakdown */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginBottom: 16 }}>Listings by Category</h3>
          {topCats.map(([cat, count]) => {
            const catLabel = categories.find(c => c.id === cat)?.label || cat
            const pct = Math.round((count / stats.total) * 100)
            return (
              <div key={cat} style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: '#374151', textTransform: 'capitalize' }}>{catLabel}</span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280' }}>{count} · {pct}%</span>
                </div>
                <div style={{ height: 6, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: '#1d3a6e', borderRadius: 99 }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Recent listings */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1a1a2e', marginBottom: 14 }}>Recent Listings</h3>
          {recent.map(l => (
            <div key={l.id} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid #f9fafb', alignItems: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f3f4f6', overflow: 'hidden', flexShrink: 0 }}>
                {l.images?.[0] && <img src={l.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{l.seller_name} · {new Date(l.created_at).toLocaleDateString('en-IN')}</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#e8473f', flexShrink: 0 }}>{formatPrice(l.price)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', padding: '20px 22px' }}>
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 26, fontWeight: 900, color }}>{value}</div>
      <div style={{ fontSize: 12.5, color: '#6b7280', marginTop: 2 }}>{label}</div>
    </div>
  )
}

/* ── Listings Manager ──────────────────────────────────── */
function ListingsTab() {
  const { showToast } = useApp()
  const [listings, setListings] = useState([])
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(null)
  const [page, setPage] = useState(0)
  const PAGE = 30

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    setLoading(true)
    const { data } = await supabase
      .from('listings')
      .select('id, title, category, price, seller_name, location, created_at, images, badge')
      .order('created_at', { ascending: false })
      .limit(500)
    setListings(data || [])
    setLoading(false)
  }

  async function deleteListing(id) {
    if (!window.confirm('Delete this listing permanently?')) return
    setDeleting(id)
    const { error } = await supabase.from('listings').delete().eq('id', id)
    if (error) {
      showToast('Delete failed — check admin RLS policy', '✕')
    } else {
      setListings(prev => prev.filter(l => l.id !== id))
      showToast('Listing deleted', '✓')
    }
    setDeleting(null)
  }

  const filtered = listings.filter(l => {
    const matchSearch = !search || l.title?.toLowerCase().includes(search.toLowerCase()) || l.seller_name?.toLowerCase().includes(search.toLowerCase())
    const matchCat = !catFilter || l.category === catFilter
    return matchSearch && matchCat
  })
  const paged = filtered.slice(page * PAGE, (page + 1) * PAGE)
  const pages = Math.ceil(filtered.length / PAGE)

  if (loading) return <Loader />

  return (
    <div style={{ padding: 24 }}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
          placeholder="Search title or seller…"
          style={{ flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none' }}
        />
        <select
          value={catFilter}
          onChange={e => { setCatFilter(e.target.value); setPage(0) }}
          style={{ padding: '9px 14px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', background: '#fff' }}
        >
          <option value="">All Categories</option>
          {categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </select>
        <button onClick={fetchAll} style={{ padding: '9px 16px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, background: '#fff', cursor: 'pointer', fontWeight: 600, color: '#374151' }}>
          Refresh
        </button>
        <div style={{ padding: '9px 14px', borderRadius: 8, background: '#f3f4f6', fontSize: 12.5, color: '#6b7280', display: 'flex', alignItems: 'center' }}>
          {filtered.length} listings
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 90px 100px 100px 70px', gap: 0, background: '#f9fafb', padding: '10px 16px', fontSize: 11, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <span></span>
          <span>Title / Seller</span>
          <span>Category</span>
          <span>Price</span>
          <span>Location</span>
          <span>Date</span>
          <span>Action</span>
        </div>

        {paged.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No listings found</div>
        ) : paged.map(l => (
          <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 90px 100px 100px 70px', gap: 0, padding: '10px 16px', borderTop: '1px solid #f3f4f6', alignItems: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background: '#f3f4f6', overflow: 'hidden' }}>
              {l.images?.[0] && <img src={l.images[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <div style={{ minWidth: 0, paddingRight: 8 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>{l.seller_name}{l.badge && <span style={{ marginLeft: 6, background: '#fef3c7', color: '#92400e', padding: '1px 5px', borderRadius: 4, fontSize: 10 }}>{l.badge}</span>}</div>
            </div>
            <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'capitalize' }}>{categories.find(c => c.id === l.category)?.label || l.category}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#e8473f' }}>{formatPrice(l.price)}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.location}</div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>{new Date(l.created_at).toLocaleDateString('en-IN')}</div>
            <button
              onClick={() => deleteListing(l.id)}
              disabled={deleting === l.id}
              style={{ padding: '5px 10px', borderRadius: 6, background: deleting === l.id ? '#f3f4f6' : '#fee2e2', color: '#dc2626', border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
            >
              {deleting === l.id ? '…' : 'Delete'}
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
          <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 12 }}>← Prev</button>
          <span style={{ padding: '7px 14px', fontSize: 12, color: '#6b7280' }}>Page {page + 1} of {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages - 1, p + 1))} disabled={page >= pages - 1} style={{ padding: '7px 14px', borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontSize: 12 }}>Next →</button>
        </div>
      )}
    </div>
  )
}

/* ── Seller Verification ───────────────────────────────── */
function VerifyTab() {
  const { showToast } = useApp()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('verification_requested_at', { ascending: false })
    if (error) showToast('Could not load profiles — run the SQL Setup step first', '✕')
    setProfiles(data || [])
    setLoading(false)
  }

  const now = Date.now()
  const pending = profiles.filter(p => p.verification_requested_at && !(p.verified_until && new Date(p.verified_until).getTime() > now))
  const verified = profiles.filter(p => p.verified_until && new Date(p.verified_until).getTime() > now)

  async function approve(p) {
    setBusy(p.id)
    const verified_until = new Date()
    verified_until.setMonth(verified_until.getMonth() + 6)
    const { error } = await supabase.from('profiles')
      .update({ verified_until: verified_until.toISOString(), verification_requested_at: null })
      .eq('id', p.id)
    if (error) showToast(error.message, '✕')
    else { showToast(`${p.full_name || p.email} verified for 6 months`, '✓'); load() }
    setBusy(null)
  }

  async function reject(p) {
    setBusy(p.id)
    const { error } = await supabase.from('profiles').update({ verification_requested_at: null }).eq('id', p.id)
    if (error) showToast(error.message, '✕')
    else { showToast('Request dismissed'); load() }
    setBusy(null)
  }

  async function revoke(p) {
    if (!window.confirm(`Revoke ${p.full_name || p.email}'s verified badge?`)) return
    setBusy(p.id)
    const { error } = await supabase.from('profiles').update({ verified_until: null }).eq('id', p.id)
    if (error) showToast(error.message, '✕')
    else { showToast('Verification revoked'); load() }
    setBusy(null)
  }

  if (loading) return <Loader />

  const Row = ({ p, children }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1a1a2e' }}>{p.full_name || 'Unnamed user'}</div>
        <div style={{ fontSize: 12, color: '#9ca3af' }}>{p.email}</div>
      </div>
      {children}
    </div>
  )

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1a1a2e', marginBottom: 4 }}>Pending Requests</h3>
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>Users who tapped "Get Started" on the verification banner</p>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {pending.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No pending requests</div>
          ) : pending.map(p => (
            <Row key={p.id} p={p}>
              <div style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>
                Requested {new Date(p.verification_requested_at).toLocaleDateString('en-IN')}
              </div>
              <button
                onClick={() => approve(p)} disabled={busy === p.id}
                style={{ padding: '6px 14px', borderRadius: 7, border: 'none', background: '#059669', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
              >
                {busy === p.id ? '…' : 'Approve · 6mo'}
              </button>
              <button
                onClick={() => reject(p)} disabled={busy === p.id}
                style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid #e5e7eb', background: '#fff', color: '#6b7280', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
              >
                Dismiss
              </button>
            </Row>
          ))}
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1a1a2e', marginBottom: 4 }}>Verified Users</h3>
        <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>Badge auto-expires after 6 months unless renewed</p>
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
          {verified.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>No verified users yet</div>
          ) : verified.map(p => (
            <Row key={p.id} p={p}>
              <div style={{ fontSize: 11, color: '#059669', flexShrink: 0 }}>
                Until {new Date(p.verified_until).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <button
                onClick={() => revoke(p)} disabled={busy === p.id}
                style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid #fca5a5', background: '#fff5f5', color: '#dc2626', fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}
              >
                Revoke
              </button>
            </Row>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── SEO Manager ───────────────────────────────────────── */
function SEOTab() {
  const [seoData, setSeoData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('bt_seo') || 'null') || defaultSEO() } catch { return defaultSEO() }
  })
  const [saved, setSaved] = useState(false)

  function defaultSEO() {
    return {
      siteTitle: "BazaarTrade.in — Buy & Sell Anything Across India for Free",
      description: "India's trusted free marketplace. Buy and sell mobiles, cars, property, bikes, electronics, furniture and more. Post ads free — no commission, no fees.",
      keywords: "buy sell india, free classifieds, used cars india, second hand mobiles, property for sale rent, online marketplace india",
      ogImage: "https://baazartrade.in/og-image.jpg",
      twitterHandle: "@BazaarTradeIn",
      googleAnalyticsId: "",
    }
  }

  function save() {
    localStorage.setItem('bt_seo', JSON.stringify(seoData))
    // Apply immediately
    document.title = seoData.siteTitle
    document.querySelector('meta[name="description"]')?.setAttribute('content', seoData.description)
    document.querySelector('meta[name="keywords"]')?.setAttribute('content', seoData.keywords)
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', seoData.siteTitle)
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', seoData.description)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const Field = ({ label, k, multiline, placeholder }) => (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 12.5, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 5 }}>{label}</label>
      {multiline ? (
        <textarea
          value={seoData[k]}
          onChange={e => setSeoData(s => ({ ...s, [k]: e.target.value }))}
          placeholder={placeholder}
          style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 70, boxSizing: 'border-box' }}
        />
      ) : (
        <input
          value={seoData[k]}
          onChange={e => setSeoData(s => ({ ...s, [k]: e.target.value }))}
          placeholder={placeholder}
          style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
        />
      )}
    </div>
  )

  return (
    <div style={{ padding: 24, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      {/* Edit form */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1a1a2e', marginBottom: 18 }}>Site Meta Tags</h3>
        <Field label="Site Title (max 60 chars)" k="siteTitle" placeholder="BazaarTrade.in — India's Marketplace" />
        <div style={{ fontSize: 11, color: seoData.siteTitle.length > 60 ? '#e8473f' : '#9ca3af', marginTop: -12, marginBottom: 12 }}>{seoData.siteTitle.length}/60 chars</div>
        <Field label="Meta Description (max 160 chars)" k="description" multiline placeholder="Describe your site in 150-160 characters…" />
        <div style={{ fontSize: 11, color: seoData.description.length > 160 ? '#e8473f' : '#9ca3af', marginTop: -12, marginBottom: 12 }}>{seoData.description.length}/160 chars</div>
        <Field label="Keywords (comma-separated)" k="keywords" multiline placeholder="buy sell india, free classifieds…" />
        <Field label="OG Image URL (1200×630px)" k="ogImage" placeholder="https://baazartrade.in/og-image.jpg" />
        <Field label="Twitter Handle" k="twitterHandle" placeholder="@BazaarTradeIn" />
        <Field label="Google Analytics ID (optional)" k="googleAnalyticsId" placeholder="G-XXXXXXXXXX" />

        <button
          onClick={save}
          style={{ width: '100%', padding: '11px', borderRadius: 10, background: saved ? '#059669' : '#1d3a6e', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 700 }}
        >
          {saved ? '✓ Saved!' : 'Save & Apply'}
        </button>
      </div>

      {/* Preview */}
      <div>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#1a1a2e', marginBottom: 18 }}>Previews</h3>

        {/* Google SERP preview */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>Google Search Result</div>
          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 16 }}>
            <div style={{ fontSize: 11, color: '#202124', marginBottom: 2 }}>{SITE_URL}</div>
            <div style={{ fontSize: 17, color: '#1a0dab', fontWeight: 400, marginBottom: 4, lineHeight: 1.3 }}>
              {seoData.siteTitle.slice(0, 60)}{seoData.siteTitle.length > 60 ? '…' : ''}
            </div>
            <div style={{ fontSize: 13, color: '#4d5156', lineHeight: 1.5 }}>
              {seoData.description.slice(0, 160)}{seoData.description.length > 160 ? '…' : ''}
            </div>
          </div>
        </div>

        {/* OG Card preview */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>Social Share Card</div>
          <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div style={{ height: 120, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              {seoData.ogImage
                ? <img src={seoData.ogImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                : <span style={{ color: '#9ca3af', fontSize: 12 }}>OG Image (1200×630)</span>}
            </div>
            <div style={{ padding: '10px 14px', background: '#f9fafb', borderTop: '1px solid #e5e7eb' }}>
              <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 2 }}>baazartrade.in</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', lineHeight: 1.3 }}>{seoData.siteTitle.slice(0, 55)}</div>
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>{seoData.description.slice(0, 80)}…</div>
            </div>
          </div>
        </div>

        {/* Status checks */}
        <div style={{ background: '#fff', borderRadius: 10, border: '1px solid #e5e7eb', padding: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 10 }}>SEO Checklist</div>
          {[
            { label: 'Title length (50-60 chars)', ok: seoData.siteTitle.length >= 50 && seoData.siteTitle.length <= 60 },
            { label: 'Description length (120-160 chars)', ok: seoData.description.length >= 120 && seoData.description.length <= 160 },
            { label: 'Keywords defined', ok: seoData.keywords.length > 0 },
            { label: 'OG Image set', ok: !!seoData.ogImage },
            { label: 'Twitter handle set', ok: !!seoData.twitterHandle },
            { label: 'robots.txt present', ok: true },
            { label: 'sitemap.xml present', ok: true },
            { label: 'JSON-LD Organisation', ok: true },
            { label: 'Dynamic listing meta', ok: true },
          ].map(({ label, ok }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, fontSize: 12 }}>
              <span style={{ color: ok ? '#059669' : '#e8473f', fontSize: 14 }}>{ok ? '✓' : '✕'}</span>
              <span style={{ color: ok ? '#374151' : '#9ca3af' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ── SQL Setup Tab ─────────────────────────────────────── */
function SQLTab() {
  const [copied, setCopied] = useState(null)

  const sql = {
    adminDelete: `-- Allow admin users to delete ANY listing
-- Run this in Supabase SQL Editor

CREATE POLICY "Admin can delete any listing"
ON public.listings FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'email' = ANY(
    string_to_array(current_setting('app.admin_emails', true), ',')
  )
  OR auth.uid()::text = user_id::text
);

-- Alternative: hardcode admin email directly
CREATE POLICY "Admin hard-coded delete"
ON public.listings FOR DELETE
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'admin.bazaartrade@gmail.com'
  OR auth.uid()::text = user_id::text
);`,

    adminUpdate: `-- Allow admin to update any listing (feature, badge, etc.)
CREATE POLICY "Admin can update any listing"
ON public.listings FOR UPDATE
TO authenticated
USING (
  auth.jwt() ->> 'email' = 'admin.bazaartrade@gmail.com'
  OR auth.uid()::text = user_id::text
)
WITH CHECK (
  auth.jwt() ->> 'email' = 'admin.bazaartrade@gmail.com'
  OR auth.uid()::text = user_id::text
);`,

    extrasColumn: `-- Add 'extras' column to store category-specific form data
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS extras jsonb DEFAULT '{}';`,

    verifiedProfiles: `-- Seller verification: extends your EXISTING profiles table (keyed by "id")
-- Run once in Supabase SQL Editor. Change the email below if your admin address differs.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS verified_until timestamptz,
  ADD COLUMN IF NOT EXISTS verification_requested_at timestamptz;

-- Safety net in case a public-read / own-row-write policy isn't already in place
DO $$ BEGIN
  CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Row-level RLS lets a user touch their own row (to request verification),
-- but this trigger blocks anyone except the admin from setting verified_until —
-- otherwise a user could self-verify via the browser console.
CREATE OR REPLACE FUNCTION public.protect_verified_until()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND NEW.verified_until IS DISTINCT FROM OLD.verified_until)
     OR (TG_OP = 'INSERT' AND NEW.verified_until IS NOT NULL) THEN
    IF coalesce(auth.jwt() ->> 'email', '') <> 'rushikesh.reddypally@gmail.com' THEN
      RAISE EXCEPTION 'Only an admin can change verified_until';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_verified_until ON public.profiles;
CREATE TRIGGER trg_protect_verified_until
BEFORE INSERT OR UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.protect_verified_until();`,
  }

  function copy(key, text) {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: 10, padding: '12px 16px', marginBottom: 24, fontSize: 13, color: '#92400e' }}>
        <strong>Important:</strong> Run these SQL statements in your <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" style={{ color: '#1d3a6e' }}>Supabase SQL Editor</a> to enable admin operations. Without them, admin delete will be blocked by RLS.
      </div>

      {Object.entries({ adminDelete: 'Admin Delete Policy', adminUpdate: 'Admin Update Policy', extrasColumn: 'Add Extras Column', verifiedProfiles: 'Seller Verification (profiles table)' }).map(([key, label]) => (
        <div key={key} style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <h4 style={{ fontSize: 13, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{label}</h4>
            <button
              onClick={() => copy(key, sql[key])}
              style={{ padding: '5px 12px', borderRadius: 6, border: '1px solid #e5e7eb', background: copied === key ? '#d1fae5' : '#fff', color: copied === key ? '#059669' : '#374151', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
            >
              {copied === key ? '✓ Copied!' : 'Copy SQL'}
            </button>
          </div>
          <pre style={{ background: '#1e293b', color: '#e2e8f0', borderRadius: 10, padding: '14px 16px', fontSize: 12, lineHeight: 1.6, overflowX: 'auto', margin: 0, fontFamily: 'monospace' }}>
            {sql[key]}
          </pre>
        </div>
      ))}
    </div>
  )
}

/* ── Blog Tab ──────────────────────────────────────────── */
const BLOG_CATS = ['tips', 'guide', 'comparison', 'news', 'update']

function slugify(str) {
  return str.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function BlogTab() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null = list, {} = new, post = edit
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)

  const emptyForm = { title: '', slug: '', excerpt: '', content: '', cover_image: '', category: 'tips', author: 'BazaarTrade Team', read_time: 3, published: false }

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }

  async function save() {
    if (!editing.title.trim() || !editing.content.trim()) return
    setSaving(true)
    const payload = { ...editing, slug: editing.slug || slugify(editing.title), updated_at: new Date().toISOString() }
    if (editing.id) {
      await supabase.from('blog_posts').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('blog_posts').insert(payload)
    }
    setSaving(false)
    setEditing(null)
    load()
  }

  async function togglePublish(post) {
    await supabase.from('blog_posts').update({ published: !post.published }).eq('id', post.id)
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, published: !p.published } : p))
  }

  async function deletePost(id) {
    if (!confirm('Delete this post? This cannot be undone.')) return
    setDeleting(id)
    await supabase.from('blog_posts').delete().eq('id', id)
    setPosts(prev => prev.filter(p => p.id !== id))
    setDeleting(null)
  }

  if (editing !== null) {
    return (
      <div style={{ padding: 24, maxWidth: 780, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button onClick={() => setEditing(null)} style={{ background: '#f3f4f6', border: 'none', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>← Back</button>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1a1a2e' }}>{editing.id ? 'Edit Post' : 'New Post'}</h3>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Title *</label>
            <input
              value={editing.title}
              onChange={e => setEditing(p => ({ ...p, title: e.target.value, slug: slugify(e.target.value) }))}
              placeholder="How to sell your phone for best price"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Slug (auto-generated)</label>
            <input
              value={editing.slug}
              onChange={e => setEditing(p => ({ ...p, slug: e.target.value }))}
              placeholder="how-to-sell-your-phone"
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box', color: '#6b7280' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Excerpt (shown on blog card)</label>
          <textarea
            value={editing.excerpt}
            onChange={e => setEditing(p => ({ ...p, excerpt: e.target.value }))}
            placeholder="A short summary shown in the blog card (1-2 sentences)…"
            rows={2}
            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Category</label>
            <select
              value={editing.category}
              onChange={e => setEditing(p => ({ ...p, category: e.target.value }))}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            >
              {BLOG_CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Author</label>
            <input
              value={editing.author}
              onChange={e => setEditing(p => ({ ...p, author: e.target.value }))}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Read time (mins)</label>
            <input
              type="number" min={1} max={60}
              value={editing.read_time}
              onChange={e => setEditing(p => ({ ...p, read_time: parseInt(e.target.value) || 3 }))}
              style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>Cover Image URL (1200×630px recommended)</label>
          <input
            value={editing.cover_image}
            onChange={e => setEditing(p => ({ ...p, cover_image: e.target.value }))}
            placeholder="https://images.unsplash.com/…"
            style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: '#374151', display: 'block', marginBottom: 4 }}>
            Content * <span style={{ fontWeight: 400, color: '#9ca3af' }}>— Use **bold**, ## Heading, ### Subheading, • bullet point</span>
          </label>
          <textarea
            value={editing.content}
            onChange={e => setEditing(p => ({ ...p, content: e.target.value }))}
            placeholder={'## Introduction\n\nWrite your post content here…\n\n**Key Point**\n• Bullet one\n• Bullet two\n\n## Conclusion\n\nWrap up here.'}
            rows={16}
            style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'monospace', lineHeight: 1.7 }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#374151' }}>
            <input
              type="checkbox"
              checked={editing.published}
              onChange={e => setEditing(p => ({ ...p, published: e.target.checked }))}
              style={{ width: 16, height: 16 }}
            />
            Publish immediately
          </label>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setEditing(null)} style={{ padding: '10px 20px', borderRadius: 9, border: '1.5px solid #e5e7eb', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#374151' }}>Cancel</button>
            <button
              onClick={save}
              disabled={saving || !editing.title.trim() || !editing.content.trim()}
              style={{ padding: '10px 24px', borderRadius: 9, border: 'none', background: '#1d3a6e', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: (saving || !editing.title.trim()) ? 0.6 : 1 }}
            >
              {saving ? 'Saving…' : 'Save Post'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 800, color: '#1a1a2e' }}>Blog Posts</h3>
          <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 2 }}>{posts.filter(p => p.published).length} published · {posts.filter(p => !p.published).length} drafts</div>
        </div>
        <button
          onClick={() => setEditing(emptyForm)}
          style={{ padding: '9px 18px', background: '#1d3a6e', color: '#fff', border: 'none', borderRadius: 9, fontSize: 13, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
        >
          + New Post
        </button>
      </div>

      {loading ? <Loader /> : posts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>✍️</div>
          <div style={{ fontSize: 14 }}>No posts yet. Create your first blog post!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {posts.map(post => (
            <div key={post.id} style={{ background: '#fff', borderRadius: 12, padding: '14px 18px', border: '1.5px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 14 }}>
              {post.cover_image && (
                <div style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                  <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{post.title}</div>
                <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 3 }}>
                  {post.category} · {post.author} · {post.read_time} min read · {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: post.published ? '#d1fae5' : '#f3f4f6', color: post.published ? '#059669' : '#9ca3af' }}>
                  {post.published ? 'Published' : 'Draft'}
                </span>
                <button onClick={() => togglePublish(post)} style={{ fontSize: 11.5, fontWeight: 600, padding: '5px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', color: '#374151' }}>
                  {post.published ? 'Unpublish' : 'Publish'}
                </button>
                <button onClick={() => setEditing(post)} style={{ fontSize: 11.5, fontWeight: 600, padding: '5px 10px', borderRadius: 6, border: '1px solid #dbeafe', background: '#eff6ff', cursor: 'pointer', color: '#1d4ed8' }}>Edit</button>
                <button onClick={() => deletePost(post.id)} disabled={deleting === post.id} style={{ fontSize: 11.5, fontWeight: 600, padding: '5px 10px', borderRadius: 6, border: '1px solid #fca5a5', background: '#fff5f5', cursor: 'pointer', color: '#dc2626' }}>
                  {deleting === post.id ? '…' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function Loader() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, color: '#9ca3af', fontSize: 13, gap: 10 }}>
      <div style={{ width: 18, height: 18, border: '2px solid #e5e7eb', borderTopColor: '#1d3a6e', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      Loading…
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
