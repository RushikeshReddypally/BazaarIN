import AnimatedIcon from './AnimatedIcon'

const VARIANTS = { normal: { scale: 1, rotate: 0 }, animate: { scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] } }

export default function VerifiedShieldIcon(props) {
  return (
    <AnimatedIcon variants={VARIANTS} transition={{ duration: 0.4 }} {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 11 14 15 10"/>
    </AnimatedIcon>
  )
}
