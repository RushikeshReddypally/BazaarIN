import AnimatedIcon from './AnimatedIcon'

const VARIANTS = { normal: { rotate: 0, scale: 1 }, animate: { rotate: 90, scale: 1.15 } }

export default function PostIcon(props) {
  return (
    <AnimatedIcon variants={VARIANTS} transition={{ duration: 0.25, ease: 'easeOut' }} {...props}>
      <path d="M12 5v14M5 12h14" />
    </AnimatedIcon>
  )
}
