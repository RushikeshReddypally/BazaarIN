import { motion } from 'motion/react'

// Rotates based on the `open` prop (dropdown state), not hover.
export default function ChevronIcon({ open, size = 10, className, style }) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={className}
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.2 }}
      style={style}
    >
      <path d="m6 9 6 6 6-6" />
    </motion.svg>
  )
}
