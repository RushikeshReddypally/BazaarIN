import PaperclipIcon from './icons/PaperclipIcon'
import SendIcon from './icons/SendIcon'

const steps = [
  {
    title: 'Create a free account',
    desc: 'Sign up with your mobile number. OTP verified in seconds.',
  },
  {
    title: 'Browse or post a listing',
    desc: 'Search millions of ads or post yours with photos, price, and a short description.',
  },
  {
    title: 'Chat & negotiate',
    desc: 'Message the seller directly. Agree on a price that works for both of you.',
  },
  {
    title: 'Meet & complete the deal',
    desc: 'Exchange in a safe public place or use doorstep delivery for select categories.',
  },
]

export default function HowItWorks() {
  return (
    <section id="how" className="section">
      <div className="container">
        <div className="sec-head reveal">
          <h2 className="sec-h"><small>Simple steps</small>How It Works</h2>
        </div>

        <div className="how-grid reveal reveal-d1">
          {/* Steps */}
          <div className="how-steps">
            {steps.map((s, i) => (
              <div key={i} className="how-step">
                <div className="hs-left">
                  <div className="hs-num">{i + 1}</div>
                  <div className="hs-line" />
                </div>
                <div className="hs-body">
                  <div className="hs-title">{s.title}</div>
                  <p className="hs-desc">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat demo */}
          <div className="chat-win">
            <div className="cw-header">
              <div className="cw-listing-thumb">📱</div>
              <div style={{ flex: 1 }}>
                <div className="cw-listing-title">iPhone 14 Pro 256GB</div>
                <div className="cw-listing-price">₹72,000</div>
              </div>
              <div>
                <div className="cw-seller-name">Priya K.</div>
                <div className="cw-online">Online now</div>
              </div>
            </div>

            <div className="cw-msgs">
              <div className="cm in">
                <div className="cm-av" style={{ background: '#9a8c98' }}>PK</div>
                <div className="cm-bub">Hi! Is this still available? 😊</div>
                <div className="cm-time">10:22</div>
              </div>
              <div className="cm out">
                <div className="cm-bub">Yes it is! Excellent condition, just 8 months old.</div>
                <div className="cm-av" style={{ background: '#22223b' }}>RS</div>
                <div className="cm-time">10:24</div>
              </div>
              <div className="cm in">
                <div className="cm-av" style={{ background: '#9a8c98' }}>PK</div>
                <div className="cm-bub">Could you do ₹68,000? I can pick up today.</div>
                <div className="cm-time">10:26</div>
              </div>
            </div>

            <div className="cw-offer">
              <div className="cw-offer-text">
                Offer: ₹68,000
                <span>From Priya K. · Just now</span>
              </div>
              <div className="cw-offer-btns">
                <button className="cw-accept">Accept</button>
                <button className="cw-decline">Decline</button>
              </div>
            </div>

            <div className="cw-input-row">
              <button className="cw-attach"><PaperclipIcon size={15} /></button>
              <input className="cw-in" type="text" placeholder="Type a message…" />
              <button className="cw-send"><SendIcon size={15} /></button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
