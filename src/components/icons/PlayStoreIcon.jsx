import AnimatedIcon from './AnimatedIcon'

const VARIANTS = { normal: { scale: 1, x: 0 }, animate: { scale: 1.15, x: 1 } }

export default function PlayStoreIcon(props) {
  return (
    <AnimatedIcon variants={VARIANTS} transition={{ duration: 0.25 }} fill="currentColor" stroke="none" {...props}>
      <path d="M3 20.5v-17c0-.83 1-.92 1.4-.37l14 8a.5.5 0 0 1 0 .74l-14 8c-.4.55-1.4.46-1.4-.37z" />
    </AnimatedIcon>
  )
}
