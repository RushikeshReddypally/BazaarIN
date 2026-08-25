import { motion, useAnimation } from 'motion/react'
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'

const BADGE_VARIANTS = {
  normal: { scale: 1, rotate: 0 },
  animate: { scale: [1, 1.15, 1], rotate: [0, 15, 0] },
}

const VerifiedBadgeIcon = forwardRef(({ onMouseEnter, onMouseLeave, className, size = 22, style, ...props }, ref) => {
  const controls = useAnimation()
  const isControlledRef = useRef(false)

  useImperativeHandle(ref, () => {
    isControlledRef.current = true
    return {
      startAnimation: () => controls.start('animate'),
      stopAnimation: () => controls.start('normal'),
    }
  })

  const handleMouseEnter = useCallback(e => {
    if (isControlledRef.current) onMouseEnter?.(e)
    else controls.start('animate')
  }, [controls, onMouseEnter])

  const handleMouseLeave = useCallback(e => {
    if (isControlledRef.current) onMouseLeave?.(e)
    else controls.start('normal')
  }, [controls, onMouseLeave])

  return (
    <div className={className} style={{ lineHeight: 0, ...style }} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...props}>
      <motion.svg
        animate={controls}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="#1d4ed8"
        transition={{ duration: 0.5, ease: 'easeInOut' }}
        variants={BADGE_VARIANTS}
      >
        <path d="M12 1l2.39 2.42 3.4-.24.24 3.4L21 8.97l-1.63 3.03L21 15.03l-2.97 1.39-.24 3.4-3.4-.24L12 22l-2.39-2.42-3.4.24-.24-3.4L3 15.03l1.63-3.03L3 8.97l2.97-1.39.24-3.4 3.4.24z"/>
        <path d="M9.5 12.2l1.8 1.8 3.2-3.6" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </motion.svg>
    </div>
  )
})

VerifiedBadgeIcon.displayName = 'VerifiedBadgeIcon'

export default VerifiedBadgeIcon
