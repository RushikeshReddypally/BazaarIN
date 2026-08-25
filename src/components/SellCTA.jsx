import { useApp } from '../context/AppContext'
import PostIcon from './icons/PostIcon'

const steps = [
  { icon: '📸', num: '01', label: 'Snap a Photo' },
  { icon: '💰', num: '02', label: 'Set Your Price' },
  { icon: '🤝', num: '03', label: 'Get Paid' },
]

export default function SellCTA() {
  const { setPostOpen } = useApp()

  return (
    <section id="sell-cta">
      <div className="sell-gradient" />
      <div className="container" style={{ maxWidth: 1100 }}>
        <div className="sell-inner reveal">
          <div className="sell-left">
            <div className="sell-eyebrow">Start Selling Today</div>
            <h2 className="sell-h">Turn clutter<br />into cash.</h2>
            <p className="sell-sub">
              Post your first ad in under 2 minutes. No listing fees, no commissions — just connect and sell.
            </p>
            <div className="sell-actions">
              <button className="btn btn-silk btn-lg hero-cta" onClick={() => setPostOpen(true)}>
                <PostIcon size={16} />
                Post Free Ad
              </button>
              <a
                href="#how"
                className="btn btn-ghost btn-lg hero-cta"
                style={{ color: 'rgba(255,255,255,.7)', borderColor: 'rgba(255,255,255,.2)' }}
              >
                How it works
              </a>
            </div>
          </div>

          <div className="sell-steps">
            {steps.map(s => (
              <div key={s.num} className="sell-step">
                <div className="ss-icon">{s.icon}</div>
                <div className="ss-num">{s.num}</div>
                <div className="ss-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
