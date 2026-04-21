const features = [
  {
    icon: '🛡️',
    title: 'Secure Payments',
    desc: 'Escrow-protected transactions keep your money safe until the deal is confirmed by both parties.',
    tag: 'Buyer Protection',
  },
  {
    icon: '✅',
    title: 'Verified Sellers',
    desc: 'Aadhaar-linked profiles and community ratings help you trade with complete confidence.',
    tag: '2-Step Verify',
  },
  {
    icon: '🆓',
    title: 'Free to Post',
    desc: 'List anything for free. Zero listing fees, zero commissions on every sale you make.',
    tag: 'Always Free',
  },
  {
    icon: '💬',
    title: 'In-App Chat',
    desc: 'Negotiate directly with buyers or sellers — no phone number ever exposed.',
    tag: 'E2E Encrypted',
  },
  {
    icon: '📍',
    title: 'Hyperlocal Search',
    desc: 'Find listings within walking distance or search the whole country in one click.',
    tag: '18+ Cities',
  },
  {
    icon: '⚡',
    title: 'Instant Alerts',
    desc: 'Get notified the moment a matching listing is posted near you. Never miss a deal.',
    tag: 'Real-time',
  },
]

export default function Features() {
  return (
    <section id="features" className="section">
      <div className="container">
        <div className="sec-head reveal">
          <h2 className="sec-h"><small>Why BazaarIN</small>Built for India</h2>
        </div>
        <div className="features-grid reveal reveal-d1">
          {features.map(f => (
            <div key={f.title} className="feat">
              <div className="feat-icon">{f.icon}</div>
              <div className="feat-title">{f.title}</div>
              <p className="feat-desc">{f.desc}</p>
              <div className="feat-tag">{f.tag}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
