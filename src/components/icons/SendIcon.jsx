import AnimatedIcon from './AnimatedIcon'

const VARIANTS = { normal: { x: 0, y: 0 }, animate: { x: [0, 4, 0], y: [0, -3, 0] } }

export default function SendIcon(props) {
  return (
    <AnimatedIcon variants={VARIANTS} transition={{ duration: 0.35 }} {...props}>
      <path d="m22 2-7 20-4-9-9-4 20-7z" />
    </AnimatedIcon>
  )
}
