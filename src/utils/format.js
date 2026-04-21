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
