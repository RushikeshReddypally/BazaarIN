const features = [
  {
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Safe Trading',
    desc: 'Meet sellers in public places and inspect items before paying. Our safety tips guide every transaction.',
    tag: 'Buyer Safety',
  },
  {
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
    title: 'Verified Sellers',
    desc: 'Email and Google-verified profiles help you trade with confidence. Every seller is authenticated before posting.',
    tag: 'Email Verified',
  },
  {
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
      </svg>
    ),
    title: 'Free to Post',
    desc: 'List anything for free. Zero listing fees, zero commissions on every sale you make.',
    tag: 'Always Free',
  },
  {
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'In-App Chat',
    desc: 'Negotiate directly with buyers or sellers through our built-in messaging system.',
    tag: 'Direct Chat',
  },
  {
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
      </svg>
    ),
    title: 'All India Search',
    desc: 'Filter by city, category, and budget to find exactly what you need anywhere in India.',
    tag: 'Pan India',
  },
  {
    icon: (
      <svg width="26" height="26" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    title: 'Instant Alerts',
    desc: 'Get notified in real-time when someone messages you about your listing. Live updates, no refresh needed.',
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
