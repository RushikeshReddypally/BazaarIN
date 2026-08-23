import AnimatedIcon from './AnimatedIcon'

const VARIANTS = { normal: { y: 0 }, animate: { y: [0, -2, 0] } }

export default function FilterIcon(props) {
  return (
    <AnimatedIcon variants={VARIANTS} transition={{ duration: 0.35 }} {...props}>
      <path d="M3 6h18M7 12h10M11 18h2" />
    </AnimatedIcon>
  )
}
