import AnimatedIcon from './AnimatedIcon'

const VARIANTS = { normal: { rotate: 0 }, animate: { rotate: 360 } }

export default function GlobeIcon(props) {
  return (
    <AnimatedIcon variants={VARIANTS} transition={{ duration: 0.7, ease: 'easeInOut' }} {...props}>
      <circle cx="12" cy="12" r="10"/><path d="M2 12h20"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </AnimatedIcon>
  )
}
