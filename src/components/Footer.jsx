import { useApp } from '../context/AppContext'
import { PAGE_SLUGS } from '../data/contentPages'
import { categoryIcons } from '../data/categories.jsx'
import XIcon from './icons/XIcon'
import LinkedInIcon from './icons/LinkedInIcon'
import FacebookIcon from './icons/FacebookIcon'
import YouTubeIcon from './icons/YouTubeIcon'
import PlayStoreIcon from './icons/PlayStoreIcon'

const links = {
  Company: ['About Us', 'Careers', 'Press', 'Blog'],
  Support:  ['Help Center', 'Safety Tips', 'Report a Problem', 'Community Guidelines'],
  Legal:    ['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Grievance Redressal', 'Sitemap'],
}

const socials = [
  { label: 'X', href: '#', Icon: XIcon },
  { label: 'LinkedIn', href: '#', Icon: LinkedInIcon },
  { label: 'Facebook', href: '#', Icon: FacebookIcon },
  { label: 'YouTube', href: '#', Icon: YouTubeIcon },
]

export default function Footer() {
  const { setActiveContentPage } = useApp()
  const AppStoreIcon = categoryIcons.mobiles

  function openPage(e, page) {
    e.preventDefault()
    setActiveContentPage(page)
  }

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
                <a key={s.label} href={s.href} className="fs-btn" title={s.label} aria-label={s.label}><s.Icon size={15} /></a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([heading, items]) => (
            <div key={heading} className="footer-col">
              <h4>{heading}</h4>
              {items.map(item => (
                <a
                  key={item}
                  href={`/${PAGE_SLUGS[item]}`}
                  className="footer-link"
                  onClick={e => openPage(e, item)}
                >
                  {item}
                </a>
              ))}
            </div>
          ))}
        </div>

        <div className="footer-bottom">
          <div>© 2026 BazaarTrade.in · Made with love in India</div>
          <div className="footer-badges">
            <div className="app-badge">
              <AppStoreIcon size={14} style={{ flexShrink: 0 }} />
              App Store
            </div>
            <div className="app-badge">
              <PlayStoreIcon size={14} style={{ flexShrink: 0 }} />
              Play Store
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
