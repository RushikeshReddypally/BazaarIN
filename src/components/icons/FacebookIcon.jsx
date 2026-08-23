import AnimatedIcon from './AnimatedIcon'

const VARIANTS = { normal: { rotate: 0 }, animate: { rotate: [0, -10, 10, 0] } }

export default function FacebookIcon(props) {
  return (
    <AnimatedIcon variants={VARIANTS} transition={{ duration: 0.4 }} fill="currentColor" stroke="none" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </AnimatedIcon>
  )
}
