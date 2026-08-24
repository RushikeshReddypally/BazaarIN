import AnimatedIcon from './AnimatedIcon'

const VARIANTS = { normal: { scale: 1 }, animate: { scale: [1, 1.12, 1] } }

export default function CameraIcon(props) {
  return (
    <AnimatedIcon variants={VARIANTS} transition={{ duration: 0.3 }} {...props}>
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </AnimatedIcon>
  )
}
