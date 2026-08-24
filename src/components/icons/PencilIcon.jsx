import AnimatedIcon from './AnimatedIcon'

const VARIANTS = { normal: { rotate: 0 }, animate: { rotate: [0, -15, 0] } }

export default function PencilIcon(props) {
  return (
    <AnimatedIcon variants={VARIANTS} transition={{ duration: 0.35 }} {...props}>
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </AnimatedIcon>
  )
}
