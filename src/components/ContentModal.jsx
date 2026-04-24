import { useEffect } from 'react'

const CONTENT = {
  'About Us': {
    title: 'About BazaarTrade',
    body: `BazaarTrade.in is India's trusted peer-to-peer marketplace, built to make buying and selling simple, safe, and free for everyone across the country.

We started with a simple belief: buying and selling secondhand goods should be as easy as a conversation between neighbours. Whether you're in Mumbai or Mangalore, BazaarTrade connects real people with real items — from smartphones and cars to furniture, fashion, and more.

**Our Mission**
To create India's most trusted marketplace where every Indian can buy, sell, and discover preloved goods without barriers, fees, or complexity.

**What We Stand For**
• Free for everyone — listing an ad costs nothing, ever
• Transparency — real users, real listings, real prices
• Safety — we provide tips and tools to help every transaction stay safe
• Local first — connecting buyers and sellers in the same city whenever possible

**Contact Us**
Email: support.bazaartrade@gmail.com
Website: www.bazaartrade.in`,
  },

  'Safety Tips': {
    title: 'Safety Tips for Buyers & Sellers',
    body: `Your safety is our top priority. Follow these guidelines for every transaction on BazaarTrade.

**For Buyers**
• Always meet in a public place — coffee shops, shopping malls, or busy market areas
• Inspect the item thoroughly before making any payment
• Never pay in advance or send money online before seeing the item
• If a deal seems too good to be true, it probably is — trust your instincts
• Bring a friend along, especially for high-value purchases
• Test electronic items (phones, laptops) before buying — check that they are not iCloud/account locked
• For vehicles, verify the RC book, insurance, and service history
• Ask for a receipt or written agreement for items above ₹10,000

**For Sellers**
• Meet buyers in public places during daylight hours
• Don't share your home address with strangers
• Accept payment only in cash or via verified UPI transfer — verify receipt before handing over the item
• For high-value items, use a bank transfer and confirm the transaction before the buyer leaves
• Be honest about the condition of your item to avoid disputes

**Red Flags to Watch Out For**
• Buyers or sellers who refuse to meet in person
• Requests to ship items before payment
• Offers that are significantly above or below market price
• Pressure to complete a transaction quickly
• Requests for OTP codes, bank details, or personal documents

**Report Suspicious Activity**
If you encounter suspicious behaviour, report it immediately at support.bazaartrade@gmail.com. We take all reports seriously and act fast.`,
  },

  'Help Center': {
    title: 'Help Center',
    body: `Find answers to the most common questions about BazaarTrade.

**Posting an Ad**
Q: How do I post an ad?
A: Click "Post Ad" in the top navigation, sign in with Google or email, fill in the details, add photos, and submit. Your ad goes live instantly.

Q: How many photos can I add?
A: Up to 10 photos per listing (JPG/PNG, max 5MB each).

Q: Is posting an ad free?
A: Yes. Posting is always free. There are no listing fees or commissions.

**Buying**
Q: How do I contact a seller?
A: Open any listing and click "Contact Seller" to send a message through our chat.

Q: How do I save a listing?
A: Click the heart icon on any listing to save it to your wishlist.

**Account**
Q: How do I sign in?
A: Use "Continue with Google" for instant access, or "Continue with Email" to receive a magic link in your inbox.

Q: How do I update my profile?
A: Click "Profile" in the top navigation to update your name, city, and contact number.

**My Ads**
Q: How do I edit or delete my listing?
A: Go to "My Ads" in the navigation, find your listing, and use the Edit or Delete options.

**Still need help?**
Email us at support.bazaartrade@gmail.com — we respond within 24 hours.`,
  },

  'Report a Problem': {
    title: 'Report a Problem',
    body: `Help us keep BazaarTrade safe and trustworthy.

**How to Report**
Email us at support.bazaartrade@gmail.com with:
• The listing URL or listing title
• The seller/buyer username or phone number (if known)
• A description of the issue
• Any screenshots or evidence

**What You Can Report**
• Fraudulent or misleading listings
• Spam or duplicate ads
• Inappropriate content
• Suspicious user behaviour
• Pricing scams or advance payment fraud
• Stolen goods being sold

**Response Time**
We review all reports within 24 hours and take action within 48 hours for confirmed violations. Repeat offenders are permanently banned.

**Emergency**
If you believe you are a victim of fraud, please also file a complaint with your local police cyber cell or report to the National Cyber Crime Reporting Portal at cybercrime.gov.in.`,
  },

  'Community Guidelines': {
    title: 'Community Guidelines',
    body: `BazaarTrade is a community of real people buying and selling. These guidelines keep everyone safe and the platform trustworthy.

**What You Can Sell**
• Preloved and new personal items
• Vehicles with valid documentation
• Property and rentals
• Services and freelance work

**What Is Not Allowed**
• Stolen or counterfeit goods
• Weapons, ammunition, or explosives
• Drugs, narcotics, or controlled substances
• Adult content or services
• Live animals (unless registered pets)
• Fake currency or financial instruments
• Misleading or false listings
• Items that violate Indian law

**Listing Rules**
• One listing per item — no duplicate ads
• Use clear, real photos of the actual item
• Price must be honest — no bait-and-switch
• Category must match the item
• Contact details must be your own

**User Conduct**
• Be respectful in all communications
• Don't share other users' personal information
• Don't spam buyers or sellers with unsolicited messages
• Honor agreed prices and meeting times

**Consequences of Violations**
Minor violations result in listing removal. Serious or repeat violations result in permanent account suspension. All decisions are final.`,
  },

  'Terms of Service': {
    title: 'Terms of Service',
    body: `Last updated: April 2026

**1. Acceptance of Terms**
By using BazaarTrade.in ("the Platform"), you agree to these Terms of Service. If you do not agree, please do not use the Platform.

**2. Who We Are**
BazaarTrade.in is a peer-to-peer classifieds marketplace that connects individual buyers and sellers across India. We are not a party to any transaction between users.

**3. User Accounts**
• You must be at least 18 years old to use the Platform
• You are responsible for all activity under your account
• Provide accurate information when registering
• Keep your login credentials secure

**4. Listings**
• You are solely responsible for the accuracy of your listings
• Prohibited items (see Community Guidelines) are not permitted
• BazaarTrade reserves the right to remove any listing without notice
• Posting false or misleading information may result in account termination

**5. Transactions**
• BazaarTrade does not process payments between buyers and sellers
• All transactions are solely between buyers and sellers
• BazaarTrade is not liable for any disputes, losses, or damages arising from transactions

**6. Intellectual Property**
• By uploading photos or content, you grant BazaarTrade a non-exclusive licence to display that content on the Platform
• Do not upload content you do not own or have rights to

**7. Limitation of Liability**
BazaarTrade provides the Platform "as is" without warranties. We are not liable for any indirect, incidental, or consequential damages arising from use of the Platform.

**8. Governing Law**
These Terms are governed by the laws of India. Any disputes shall be resolved in the courts of Hyderabad, Telangana.

**9. Changes to Terms**
We may update these Terms at any time. Continued use of the Platform constitutes acceptance of the updated Terms.

**Contact:** support.bazaartrade@gmail.com`,
  },

  'Privacy Policy': {
    title: 'Privacy Policy',
    body: `Last updated: April 2026

**1. Information We Collect**
• Account information: name, email address, Google profile (when signing in with Google)
• Listing information: photos, descriptions, prices, and location you provide
• Usage data: pages visited, search queries, listing views
• Device information: browser type, IP address, device type

**2. How We Use Your Information**
• To operate and improve the Platform
• To display your listings to potential buyers
• To send account-related emails (magic link sign-in)
• To prevent fraud and maintain platform safety
• To comply with legal obligations

**3. Information We Share**
• Your name and city are shown publicly on your listings
• We do not sell your personal data to third parties
• We may share data with service providers (Supabase for database/auth, Vercel for hosting) under strict data processing agreements
• We may disclose data if required by Indian law

**4. Data Storage**
Your data is stored securely on Supabase infrastructure. We use industry-standard encryption for data in transit and at rest.

**5. Your Rights**
• Access your personal data at any time via your Profile
• Request deletion of your account and data by emailing support.bazaartrade@gmail.com
• Opt out of non-essential communications

**6. Cookies**
We use essential cookies for authentication and session management. No advertising or tracking cookies are used.

**7. Children's Privacy**
BazaarTrade is not intended for users under 18. We do not knowingly collect data from minors.

**8. Changes**
We will notify users of material changes to this policy via email or a notice on the Platform.

**Contact:** support.bazaartrade@gmail.com`,
  },

  'Cookie Policy': {
    title: 'Cookie Policy',
    body: `Last updated: April 2026

**What Are Cookies**
Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and keep you signed in.

**Cookies We Use**

Essential Cookies (Required)
• Authentication token — keeps you signed in across sessions
• Session cookie — maintains your active session
These cannot be disabled as the Platform would not function without them.

**Cookies We Do Not Use**
• Advertising or tracking cookies
• Third-party analytics cookies
• Social media tracking pixels

**Third-Party Services**
We use Supabase for authentication, which may set its own session cookies. These are governed by Supabase's privacy policy.

**Managing Cookies**
You can clear cookies at any time through your browser settings. Note that clearing cookies will sign you out of BazaarTrade.

**Contact:** support.bazaartrade@gmail.com`,
  },

  'Sitemap': {
    title: 'Sitemap',
    body: `**Main Sections**
• Home — www.bazaartrade.in
• All Listings — www.bazaartrade.in/#listings
• Post an Ad — Sign in and click "Post Ad"
• Categories — Cars, Bikes, Mobiles, Electronics, Property, Furniture, Fashion, Books, Sports, Pets, Gaming, Services, Kids

**Account**
• Sign In / Register
• My Profile
• My Ads
• Saved / Wishlist
• Messages

**Information**
• About Us
• Safety Tips
• Help Center
• Community Guidelines
• Terms of Service
• Privacy Policy
• Cookie Policy

**Contact**
• Email: support.bazaartrade@gmail.com
• Website: www.bazaartrade.in`,
  },

  'Careers': {
    title: 'Careers at BazaarTrade',
    body: `We're building India's most trusted marketplace and we'd love your help.

BazaarTrade is an early-stage startup. We're passionate about making buying and selling simple, safe, and free for every Indian.

**Current Openings**
We are actively looking for talented individuals in:
• Full-Stack Development (React, Node.js, Supabase)
• Product Design (UI/UX)
• Growth & Marketing
• Customer Support

**What We Value**
• Ownership — you'll have real impact from day one
• Simplicity — we build things that just work
• Speed — we ship fast and learn faster
• Empathy — we build for real users, not metrics

**How to Apply**
Send your resume and a short note about why you want to join BazaarTrade to:
support.bazaartrade@gmail.com

Subject line: "Careers — [Role]"

We read every application and respond within a week.`,
  },

  'Press': {
    title: 'Press & Media',
    body: `For press enquiries, partnership proposals, or media requests about BazaarTrade.in, please contact us at:

**Email:** support.bazaartrade@gmail.com
**Subject:** Press Enquiry

**About BazaarTrade**
BazaarTrade.in is India's trusted peer-to-peer classifieds marketplace, connecting buyers and sellers across every city in India. The platform is free to use — free to post, free to buy.

**Key Facts**
• Launched: 2026
• Headquarters: India
• Platform: Web (www.bazaartrade.in)
• Categories: 14 categories covering cars, mobiles, property, and more
• Model: Free classifieds marketplace

We aim to respond to all media enquiries within 48 hours.`,
  },

  'Blog': {
    title: 'BazaarTrade Blog',
    body: `Our blog is coming soon!

We'll be sharing:
• Tips for buying and selling safely in India
• How to get the best price for your items
• Category guides (how to buy a used car, what to check before buying a used phone, etc.)
• Platform updates and new features
• Success stories from our community

**Stay Updated**
Follow us and check back soon at www.bazaartrade.in

Have a topic you'd like us to cover?
Email: support.bazaartrade@gmail.com`,
  },
}

export default function ContentModal({ page, onClose }) {
  const content = CONTENT[page]

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!content) return null

  function renderBody(text) {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**'))
        return <div key={i} style={{ fontWeight: 700, color: '#1a1a2e', fontSize: 15, marginTop: 20, marginBottom: 4 }}>{line.slice(2, -2)}</div>
      if (line.startsWith('• '))
        return <div key={i} style={{ display: 'flex', gap: 8, padding: '2px 0', fontSize: 14, color: '#4b5563' }}><span style={{ color: '#1d3a6e', flexShrink: 0 }}>•</span>{line.slice(2)}</div>
      if (line.trim() === '')
        return <div key={i} style={{ height: 6 }} />
      return <p key={i} style={{ fontSize: 14, color: '#4b5563', lineHeight: 1.7 }}>{line}</p>
    })
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(22,22,40,0.6)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: '#fff', borderRadius: 20, width: '100%', maxWidth: 640,
        maxHeight: '88vh', display: 'flex', flexDirection: 'column',
        boxShadow: '0 32px 80px rgba(0,0,0,0.22)',
        animation: 'slideUp 0.22s cubic-bezier(.34,1.56,.64,1)',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 28px', borderBottom: '1px solid #f3f4f6',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
        }}>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#1a1a2e', letterSpacing: '-0.4px' }}>{content.title}</div>
          <button onClick={onClose} style={{
            width: 32, height: 32, borderRadius: '50%', background: '#f3f4f6',
            border: 'none', cursor: 'pointer', fontSize: 16, color: '#6b7280',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>
        {/* Body */}
        <div style={{ padding: '20px 28px 28px', overflowY: 'auto' }}>
          {renderBody(content.body)}
        </div>
      </div>
      <style>{`@keyframes slideUp{from{transform:translateY(20px) scale(.97);opacity:0}to{transform:none;opacity:1}}`}</style>
    </div>
  )
}
