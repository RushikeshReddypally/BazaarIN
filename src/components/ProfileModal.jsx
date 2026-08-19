import { useApp } from '../context/AppContext'
import BasicInfoSection from './profile/BasicInfoSection'
import AddressesSection from './profile/AddressesSection'
import SecuritySection from './profile/SecuritySection'

const NAV_GROUPS = [
  { label: 'Profile', items: [{ id: 'basic', label: 'Basic Info' }, { id: 'addresses', label: 'My Addresses' }] },
  { label: 'Account', items: [{ id: 'security', label: 'Security' }] },
]

export default function ProfileModal() {
  const { profileOpen, setProfileOpen, profileTab: tab, setProfileTab: setTab, user, showToast, deleteAccount } = useApp()

  if (!profileOpen) return null

  function close() { setProfileOpen(false) }

  return (
    <div style={{
      position: 'fixed', top: 62, left: 0, right: 0, bottom: 0,
      zIndex: 1300, background: '#f5f6f7', overflowY: 'auto',
      animation: 'profilePageIn 0.18s ease',
    }}>
      {/* ── Secondary bar: back button ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px', height: 44, display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={close}
            style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#1d3a6e', background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back
          </button>
          <span style={{ color: '#d1d5db' }}>|</span>
          <span style={{ fontSize: 12, color: '#9ca3af' }}>Profile Settings</span>
        </div>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 24px 60px' }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a2e', margin: '0 0 20px' }}>Profile Settings</h1>

        <div className="profile-cols" style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
          {/* Sidebar */}
          <div style={{ width: 220, flexShrink: 0, background: '#fff', borderRadius: 14, border: '1.5px solid #e5e7eb', padding: 10 }}>
            {NAV_GROUPS.map(group => (
              <div key={group.label} style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '8px 10px 4px' }}>
                  {group.label}
                </div>
                {group.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    style={{
                      width: '100%', textAlign: 'left', padding: '9px 10px', borderRadius: 8,
                      border: 'none', cursor: 'pointer', fontSize: 13.5,
                      fontWeight: tab === item.id ? 700 : 500,
                      background: tab === item.id ? '#eef2ff' : 'transparent',
                      color: tab === item.id ? '#1d3a6e' : '#374151',
                      borderLeft: tab === item.id ? '3px solid #1d3a6e' : '3px solid transparent',
                    }}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {tab === 'basic' && <BasicInfoSection user={user} showToast={showToast} />}
            {tab === 'addresses' && <AddressesSection user={user} showToast={showToast} />}
            {tab === 'security' && <SecuritySection user={user} deleteAccount={deleteAccount} showToast={showToast} />}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes profilePageIn { from { opacity: 0; transform: translateY(12px) } to { opacity: 1; transform: none } }
        @media (max-width: 640px) {
          .profile-cols { flex-direction: column; }
          .profile-cols > div:first-child { width: 100% !important; display: flex; overflow-x: auto; }
        }
      `}</style>
    </div>
  )
}
