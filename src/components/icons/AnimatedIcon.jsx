import { motion, useAnimation } from 'motion/react'
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'

// Generic hover-animated SVG wrapper, matching the API/behavior of the
// lucide-animated icons used elsewhere (forwardRef + imperative start/stop,
// or automatic hover trigger when unused). Pass `variants`/`transition` and
// the raw <path>/<circle> children to build a new animated icon without
// repeating the boilerplate.
const AnimatedIcon = forwardRef(({
  onMouseEnter, onMouseLeave, className, size = 28,
  variants, transition, fill = 'none', viewBox = '0 0 24 24',
  children, ...props
}, ref) => {
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
    <div className={className} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} {...props}>
      <motion.svg
        animate={controls}
        fill={fill}
        height={size}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        transition={transition}
        variants={variants}
        viewBox={viewBox}
        width={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        {children}
      </motion.svg>
    </div>
  )
})

AnimatedIcon.displayName = 'AnimatedIcon'

export default AnimatedIcon
