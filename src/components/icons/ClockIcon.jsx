import AnimatedIcon from './AnimatedIcon'

const VARIANTS = { normal: { rotate: 0 }, animate: { rotate: 360 } }

export default function ClockIcon(props) {
  return (
    <AnimatedIcon variants={VARIANTS} transition={{ duration: 0.5, ease: 'easeInOut' }} {...props}>
      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
    </AnimatedIcon>
  )
}
