import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { useVerification } from '../hooks/useVerification'
import VerificationRequestModal from './VerificationRequestModal'
import VerifiedBadgeIcon from './icons/VerifiedBadgeIcon'

function getName(user) {
  return user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Anonymous'
}

export default function VerifiedBanner() {
  const { user, setLoginOpen, showToast } = useApp()
  const { profile, isVerified, isPending, requestVerification } = useVerification(user)
  const [modalOpen, setModalOpen] = useState(false)

  function handleClick() {
    if (!user) { setLoginOpen(true); return }
    if (isVerified) {
      showToast(`You're verified until ${new Date(profile.verified_until).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`, '✓')
      return
    }
    if (isPending) {
      showToast('Your verification request is pending review', 'ℹ️')
      return
    }
    setModalOpen(true)
  }

  async function handleSubmitDocs(docs) {
    const { error } = await requestVerification({ full_name: profile?.full_name || getName(user), ...docs })
    if (error) { showToast("Couldn't send request — try again later", '✕'); throw error }
    showToast('Request sent! Our team will review it shortly.', '✓')
  }

  const buttonLabel = isVerified ? 'Verified ✓' : isPending ? 'Pending review' : 'Get Started'

  return (
    <div className="vb">
      <div className="vb-icon">
        <VerifiedBadgeIcon size={22} />
      </div>

      <div className="vb-text">
        <span className="vb-title">
          {isVerified ? "You're a verified seller" : 'Got a verified badge yet?'}
        </span>
        {!isVerified && (
          <span className="vb-sub">
            Get more visibility <span className="vb-divider">|</span> Enhance your credibility
          </span>
        )}
      </div>

      <button
        onClick={handleClick}
        disabled={isPending}
        className="vb-btn"
        style={{
          background: isVerified ? '#059669' : '#fff',
          color: isVerified ? '#fff' : '#1a1a2e',
          cursor: isPending ? 'default' : 'pointer',
          boxShadow: isVerified ? 'none' : '0 1px 4px rgba(0,0,0,0.08)',
          opacity: isPending ? 0.7 : 1,
        }}
      >
        {buttonLabel}
      </button>

      {modalOpen && (
        <VerificationRequestModal
          user={user}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmitDocs}
          showToast={showToast}
        />
      )}
    </div>
  )
}
