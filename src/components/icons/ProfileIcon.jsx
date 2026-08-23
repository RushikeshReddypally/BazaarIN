import AnimatedIcon from './AnimatedIcon'

const VARIANTS = { normal: { y: 0 }, animate: { y: [0, -2, 0] } }

export default function ProfileIcon(props) {
  return (
    <AnimatedIcon variants={VARIANTS} transition={{ duration: 0.35 }} {...props}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </AnimatedIcon>
  )
}
