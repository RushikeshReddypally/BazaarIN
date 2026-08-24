import AnimatedIcon from './AnimatedIcon'

const VARIANTS = { normal: { x: 0 }, animate: { x: [0, -3, 0] } }

export default function ChevronLeftIcon(props) {
  return (
    <AnimatedIcon variants={VARIANTS} transition={{ duration: 0.3 }} {...props}>
      <path d="M15 18l-6-6 6-6" />
    </AnimatedIcon>
  )
}
