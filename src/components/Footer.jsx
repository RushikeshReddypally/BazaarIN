const links = {
  Company: ['About Us', 'Careers', 'Press', 'Blog'],
  Support:  ['Help Center', 'Safety Tips', 'Report a Problem', 'Community Guidelines'],
  Legal:    ['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Sitemap'],
}

const socials = [
  { label: '𝕏', href: '#' },
  { label: 'in', href: '#' },
  { label: 'f', href: '#' },
  { label: '▶', href: '#' },
]

export default function Footer() {
  return (
    <footer>
      <div className="container" style={{ maxWidth: 1200 }}>
        <div className="footer-top">
          <div className="footer-brand">
            <div className="nav-logo" style={{ color: 'var(--white)' }}>
              BazaarTrade<span className="nav-logo-dot" />in
            </div>
            <p>India's trusted marketplace for buying and selling preloved goods across every city in India.</p>
            <div className="footer-social">
              {socials.map(s => (
                <a key={s.label} href={s.href} className="fs-btn">{s.label}</a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([heading, items]) => (
            <div key={heading} className="footer-col">
              <h4>{heading}</h4>
              {items.map(item => (
                <a key={item} href="#" className="footer-link">{item}</a>
              ))}
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <div>© 2026 BazaarTrade.in · Made with ❤️ in India</div>
          <div className="footer-badges">
            <div className="app-badge">📱 App Store</div>
            <div className="app-badge">▶ Play Store</div>
          </div>
        </div>
      </div>
    </footer>
  )
}
