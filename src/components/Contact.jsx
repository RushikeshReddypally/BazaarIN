import { useState } from 'react'
import { useApp } from '../context/AppContext'

const contactCards = [
  { icon: '💬', title: 'Live Chat',      sub: 'Typically replies in minutes',           href: '#' },
  { icon: '📧', title: 'Email Support',  sub: 'support@bazaarin.in',                   href: 'mailto:support@bazaarin.in' },
  { icon: '📞', title: 'Phone Support',  sub: '1800-000-0000 · Mon–Sat 9am–6pm',       href: 'tel:18000000000' },
]

const emptyForm = { name: '', email: '', subject: '', message: '' }

export default function Contact() {
  const { showToast } = useApp()
  const [form, setForm] = useState(emptyForm)

  function set(key) {
    return e => setForm(f => ({ ...f, [key]: e.target.value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    showToast("Message sent! We'll reply within 24 hours.", '✉️')
    setForm(emptyForm)
  }

  return (
    <section id="contact" className="section">
      <div className="container">
        <div className="sec-head reveal">
          <h2 className="sec-h"><small>We're here to help</small>Contact Us</h2>
        </div>

        <div className="contact-wrap">
          <div className="contact-left reveal">
            <p className="cl-desc">
              Have a question, a report, or just want to say hi? Our team is available 6 days a week.
            </p>
            <div className="cl-cards">
              {contactCards.map(c => (
                <a key={c.title} href={c.href} className="cl-card">
                  <div className="cl-icon">{c.icon}</div>
                  <div>
                    <div className="cl-title">{c.title}</div>
                    <div className="cl-sub">{c.sub}</div>
                  </div>
                  <div className="cl-arrow">›</div>
                </a>
              ))}
            </div>
          </div>

          <form className="contact-form reveal reveal-d2" onSubmit={handleSubmit}>
            <div className="cf-title">Send us a message</div>
            <p className="cf-sub">Fill out the form and we'll get back to you within 24 hours.</p>

            <div className="fr-row">
              <div className="fr">
                <label>Name</label>
                <input value={form.name} onChange={set('name')} placeholder="Your name" required />
              </div>
              <div className="fr">
                <label>Email</label>
                <input type="email" value={form.email} onChange={set('email')} placeholder="you@email.com" required />
              </div>
            </div>
            <div className="fr">
              <label>Subject</label>
              <input value={form.subject} onChange={set('subject')} placeholder="How can we help?" required />
            </div>
            <div className="fr">
              <label>Message</label>
              <textarea value={form.message} onChange={set('message')} placeholder="Tell us more…" required />
            </div>

            <button type="submit" className="fr-submit">
              Send Message
              <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path d="m22 2-7 20-4-9-9-4 20-7z" />
              </svg>
            </button>
            <p className="fr-privacy">By submitting, you agree to our <a href="#">Privacy Policy</a></p>
          </form>
        </div>
      </div>
    </section>
  )
}
