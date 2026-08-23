import ShieldIcon from './icons/ShieldIcon'
import VerifiedShieldIcon from './icons/VerifiedShieldIcon'
import DocumentIcon from './icons/DocumentIcon'
import SpeechBubbleIcon from './icons/SpeechBubbleIcon'
import SearchIcon from './icons/SearchIcon'
import BellIcon from './icons/BellIcon'

const features = [
  { Icon: ShieldIcon, title: 'Safe Trading', desc: 'Meet sellers in public places and inspect items before paying. Our safety tips guide every transaction.', tag: 'Buyer Safety' },
  { Icon: VerifiedShieldIcon, title: 'Verified Sellers', desc: 'Email and Google-verified profiles help you trade with confidence. Every seller is authenticated before posting.', tag: 'Email Verified' },
  { Icon: DocumentIcon, title: 'Free to Post', desc: 'List anything for free. Zero listing fees, zero commissions on every sale you make.', tag: 'Always Free' },
  { Icon: SpeechBubbleIcon, title: 'In-App Chat', desc: 'Negotiate directly with buyers or sellers through our built-in messaging system.', tag: 'Direct Chat' },
  { Icon: SearchIcon, title: 'All India Search', desc: 'Filter by city, category, and budget to find exactly what you need anywhere in India.', tag: 'Pan India' },
  { Icon: BellIcon, title: 'Instant Alerts', desc: 'Get notified in real-time when someone messages you about your listing. Live updates, no refresh needed.', tag: 'Real-time' },
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
              <div className="feat-icon"><f.Icon size={26} /></div>
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
