import AnimatedIcon from './AnimatedIcon'

const VARIANTS = { normal: { scale: 1, rotate: 0 }, animate: { scale: [1, 1.2, 1], rotate: [0, 90] } }

export default function GpsIcon(props) {
  return (
    <AnimatedIcon variants={VARIANTS} transition={{ duration: 0.5, ease: 'easeInOut' }} {...props}>
      <circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>
      <circle cx="12" cy="12" r="8" strokeOpacity=".3"/>
    </AnimatedIcon>
  )
}
