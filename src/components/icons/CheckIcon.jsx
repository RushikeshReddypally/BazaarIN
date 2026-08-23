import { motion } from 'motion/react'

// Pops in on mount — used for "selected" checkmarks, not hover-driven.
export default function CheckIcon({ size = 13, color = 'currentColor', className }) {
  return (
    <motion.svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
      className={className}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
    >
      <path d="M20 6 9 17l-5-5" />
    </motion.svg>
  )
}
