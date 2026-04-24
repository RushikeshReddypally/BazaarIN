const features = [
  {
    icon: '🛡️',
    title: 'Safe Trading',
    desc: 'Meet sellers in public places and inspect items before paying. Our safety tips guide every transaction.',
    tag: 'Buyer Safety',
  },
  {
    icon: '✅',
    title: 'Verified Sellers',
    desc: 'Phone-verified profiles and community ratings help you trade with confidence.',
    tag: 'Phone Verified',
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
    desc: 'Negotiate directly with buyers or sellers through our built-in messaging system.',
    tag: 'Direct Chat',
  },
  {
    icon: '📍',
    title: 'All India Search',
    desc: 'Filter by city, category, and budget to find exactly what you need anywhere in India.',
    tag: 'Pan India',
  },
  {
    icon: '⚡',
    title: 'Instant Alerts',
    desc: 'Get notified the moment someone messages you about your listing. Never miss a deal.',
    tag: 'Real-time',
  },
]

export default function Features() {
  return (
    <section id="features" className="section">
      <div className="container">
        <div className="sec-head reveal">
          <h2 className="sec-h"><small>Why BazaarTrade</small>Built for India</h2>
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
