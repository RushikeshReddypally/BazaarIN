import { motion } from 'motion/react'

// Crossfades between hamburger lines and an X, driven by the `open` prop
// (not hover) — used for the mobile menu toggle button.
export default function HamburgerIcon({ open, size = 20, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className={className}>
      <motion.g
        animate={{ opacity: open ? 0 : 1, rotate: open ? 90 : 0 }}
        style={{ originX: '12px', originY: '12px' }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        <path d="M4 6h16M4 12h16M4 18h16" />
      </motion.g>
      <motion.g
        animate={{ opacity: open ? 1 : 0, rotate: open ? 0 : -90 }}
        style={{ originX: '12px', originY: '12px' }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      >
        <path d="M18 6 6 18M6 6l12 12" />
      </motion.g>
    </svg>
  )
}
