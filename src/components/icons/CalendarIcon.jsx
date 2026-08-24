import AnimatedIcon from './AnimatedIcon'

const VARIANTS = { normal: { scale: 1 }, animate: { scale: [1, 1.15, 1] } }

export default function CalendarIcon(props) {
  return (
    <AnimatedIcon variants={VARIANTS} transition={{ duration: 0.3 }} {...props}>
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" />
    </AnimatedIcon>
  )
}
