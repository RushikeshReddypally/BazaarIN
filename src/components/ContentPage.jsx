import { useApp } from '../context/AppContext'
import { useSEO } from '../hooks/useSEO'
import { CONTENT, PAGE_SLUGS } from '../data/contentPages'
import BackArrowIcon from './icons/BackArrowIcon'

function renderBody(text) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**'))
      return <h2 key={i} style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 16, marginTop: 22, marginBottom: 6 }}>{line.slice(2, -2)}</h2>
    if (line.startsWith('• '))
      return <div key={i} style={{ display: 'flex', gap: 8, padding: '2px 0', fontSize: 14, color: '#4b5563' }}><span style={{ color: '#1d3a6e', flexShrink: 0 }}>•</span>{line.slice(2)}</div>
    if (line.trim() === '')
      return <div key={i} style={{ height: 6 }} />
    return <p key={i} style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7 }}>{line}</p>
  })
}

function excerpt(body) {
  const firstPara = body.split('\n').find(l => l.trim() && !l.startsWith('**'))
  return (firstPara || '').replace(/\*\*/g, '').slice(0, 155)
}

export default function ContentPage() {
  const { activeContentPage, setActiveContentPage } = useApp()
  const content = CONTENT[activeContentPage]

  useSEO(content ? {
    title: content.title,
    description: excerpt(content.body),
    url: `/${PAGE_SLUGS[activeContentPage]}`,
  } : {})

  if (!content) return null

  return (
    <div style={{
      position: 'fixed', top: 62, left: 0, right: 0, bottom: 0,
      zIndex: 1300, background: '#f5f6f7', overflowY: 'auto',
    }}>
      {/* ── Secondary bar: back button ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', padding: '0 24px', height: 44, display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setActiveContentPage(null)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#1d3a6e', background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
          >
            <BackArrowIcon size={14} />
            Back
          </button>
          <span style={{ color: '#d1d5db' }}>|</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>{content.title}</span>
        </div>
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '24px 24px 60px', animation: 'contentPageIn 0.18s ease' }}>
        <div style={{ background: '#fff', borderRadius: 14, border: '1.5px solid #e5e7eb', padding: '28px 32px' }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.3px', margin: '0 0 8px' }}>
            {content.title}
          </h1>
          {renderBody(content.body)}
        </div>
      </div>

      <style>{`@keyframes contentPageIn { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }`}</style>
    </div>
  )
}
