import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useSEO } from '../hooks/useSEO'

const CAT = {
  tips:       { bg: '#f0fdf4', color: '#166534', label: 'Tips' },
  guide:      { bg: '#eff6ff', color: '#1d4ed8', label: 'Guide' },
  comparison: { bg: '#fdf4ff', color: '#7e22ce', label: 'Comparison' },
  news:       { bg: '#fff7ed', color: '#c2410c', label: 'News' },
  update:     { bg: '#f0f9ff', color: '#0369a1', label: 'Update' },
}

function fmtDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function renderContent(text) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('## '))
      return <h2 key={i} style={{ fontSize: 20, fontWeight: 800, color: '#1a1a2e', margin: '28px 0 10px', letterSpacing: '-0.4px' }}>{line.slice(3)}</h2>
    if (line.startsWith('### '))
      return <h3 key={i} style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', margin: '20px 0 8px' }}>{line.slice(4)}</h3>
    if (line.startsWith('**') && line.endsWith('**'))
      return <div key={i} style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 15, margin: '18px 0 6px' }}>{line.slice(2, -2)}</div>
    if (line.startsWith('• '))
      return <div key={i} style={{ display: 'flex', gap: 10, padding: '3px 0', fontSize: 14.5, color: '#374151', lineHeight: 1.65 }}>
        <span style={{ color: '#1d3a6e', flexShrink: 0, marginTop: 2 }}>•</span>{line.slice(2)}
      </div>
    if (line.trim() === '')
      return <div key={i} style={{ height: 10 }} />
    return <p key={i} style={{ fontSize: 14.5, color: '#374151', lineHeight: 1.75, margin: '4px 0' }}>{line}</p>
  })
}

/* ── Blog post reader modal ─────────────────────────────── */
function BlogPostModal({ post, onClose }) {
  useSEO({ title: post.title, description: post.excerpt })
  const cat = CAT[post.category] || CAT.tips

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1800, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 720, maxHeight: '92vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.22)' }}>
        {/* Cover */}
        <div style={{ height: 220, background: 'linear-gradient(135deg,#1a1a2e,#2d3561)', position: 'relative', flexShrink: 0 }}>
          {post.cover_image && (
            <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }} />
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: 14, right: 14, width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >✕</button>
          <div style={{ position: 'absolute', bottom: 16, left: 20, right: 20 }}>
            <span style={{ background: cat.bg, color: cat.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>{cat.label}</span>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginTop: 8, lineHeight: 1.3, letterSpacing: '-0.4px' }}>{post.title}</div>
          </div>
        </div>

        {/* Meta */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12, fontSize: 12.5, color: '#9ca3af', flexShrink: 0 }}>
          <span style={{ fontWeight: 600, color: '#4b5563' }}>{post.author}</span>
          <span>·</span>
          <span>{fmtDate(post.created_at)}</span>
          <span>·</span>
          <span>{post.read_time} min read</span>
        </div>

        {/* Content */}
        <div style={{ padding: '24px 28px 32px', overflowY: 'auto' }}>
          {post.excerpt && (
            <p style={{ fontSize: 16, color: '#6b7280', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid #f3f4f6' }}>{post.excerpt}</p>
          )}
          {renderContent(post.content)}
        </div>
      </div>
    </div>
  )
}

/* ── Blog card ──────────────────────────────────────────── */
function BlogCard({ post, onClick }) {
  const cat = CAT[post.category] || CAT.tips
  return (
    <div
      onClick={onClick}
      style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', border: '1.5px solid #f3f4f6', cursor: 'pointer', transition: 'transform 0.18s, box-shadow 0.18s', display: 'flex', flexDirection: 'column' }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.1)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
    >
      <div style={{ height: 180, background: 'linear-gradient(135deg,#1a1a2e,#2d3561)', position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
        {post.cover_image
          ? <img src={post.cover_image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: 52, opacity: 0.2 }}>📝</div>
        }
        <div style={{ position: 'absolute', top: 12, left: 12, background: cat.bg, color: cat.color, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99 }}>{cat.label}</div>
      </div>
      <div style={{ padding: '16px 18px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: '#1a1a2e', lineHeight: 1.4, marginBottom: 8 }}>{post.title}</div>
        <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>{post.excerpt}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 14, fontSize: 11.5, color: '#9ca3af' }}>
          <span>{post.author}</span><span>·</span>
          <span>{fmtDate(post.created_at)}</span><span>·</span>
          <span>{post.read_time} min read</span>
        </div>
      </div>
    </div>
  )
}

/* ── Blog section (homepage) ────────────────────────────── */
export default function Blog() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState(null)

  useEffect(() => {
    supabase
      .from('blog_posts')
      .select('*')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(3)
      .then(({ data }) => { setPosts(data || []); setLoading(false) })
  }, [])

  if (loading || posts.length === 0) return null

  return (
    <section style={{ padding: '64px 0', background: '#f8f9fb' }}>
      <div className="container" style={{ maxWidth: 1200 }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1d3a6e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>From the Blog</div>
          <h2 style={{ fontSize: 28, fontWeight: 900, color: '#1a1a2e', letterSpacing: '-0.6px', margin: 0 }}>Tips, Guides & Updates</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
          {posts.map(post => (
            <BlogCard key={post.id} post={post} onClick={() => setActive(post)} />
          ))}
        </div>
      </div>
      {active && <BlogPostModal post={active} onClose={() => setActive(null)} />}
    </section>
  )
}
