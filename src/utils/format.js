export function formatPrice(amount) {
  if (amount >= 100000) {
    const v = amount / 100000
    return '₹' + (v % 1 === 0 ? v : v.toFixed(1)) + ' L'
  }
  if (amount >= 1000) {
    const v = amount / 1000
    return '₹' + (v % 1 === 0 ? v : v.toFixed(1)) + 'K'
  }
  return '₹' + amount.toLocaleString('en-IN')
}

export function formatPriceFull(amount) {
  return '₹' + amount.toLocaleString('en-IN')
}

export function formatTimeAgo(dateString) {
  if (!dateString) return ''
  const diffMs = Date.now() - new Date(dateString).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min${mins !== 1 ? 's' : ''} ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`
  const years = Math.floor(months / 12)
  return `${years} year${years !== 1 ? 's' : ''} ago`
}
