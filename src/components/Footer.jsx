import { useState } from 'react'
import ContentModal from './ContentModal'

const links = {
  Company: ['About Us', 'Careers', 'Press', 'Blog'],
  Support:  ['Help Center', 'Safety Tips', 'Report a Problem', 'Community Guidelines'],
  Legal:    ['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Sitemap'],
}

const socials = [
  {
    label: 'X',
    href: '#',
    icon: (
      <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: '#',
    icon: (
      <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: '#',
    icon: (
      <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
  {
    label: 'YouTube',
    href: '#',
    icon: (
      <svg width="15" height="15" fill="currentColor" viewBox="0 0 24 24">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
        <polygon fill="#fff" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
      </svg>
    ),
  },
]

export default function Footer() {
  const [contentPage, setContentPage] = useState(null)

  return (
    <>
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
                  <a key={s.label} href={s.href} className="fs-btn" title={s.label} aria-label={s.label}>{s.icon}</a>
                ))}
              </div>
            </div>

            {Object.entries(links).map(([heading, items]) => (
              <div key={heading} className="footer-col">
                <h4>{heading}</h4>
                {items.map(item => (
                  <button
                    key={item}
                    className="footer-link"
                    onClick={() => setContentPage(item)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left', fontFamily: 'inherit' }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            ))}
          </div>

          <div className="footer-bottom">
            <div>© 2026 BazaarTrade.in · Made with love in India</div>
            <div className="footer-badges">
              <div className="app-badge">
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <rect x="5" y="2" width="14" height="20" rx="2" />
                  <line x1="12" y1="18" x2="12.01" y2="18" />
                </svg>
                App Store
              </div>
              <div className="app-badge">
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
                  <path d="M3 20.5v-17c0-.83 1-.92 1.4-.37l14 8a.5.5 0 0 1 0 .74l-14 8c-.4.55-1.4.46-1.4-.37z" />
                </svg>
                Play Store
              </div>
            </div>
          </div>
        </div>
      </footer>

      {contentPage && (
        <ContentModal page={contentPage} onClose={() => setContentPage(null)} />
      )}
    </>
  )
}
