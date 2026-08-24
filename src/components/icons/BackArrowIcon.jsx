import AnimatedIcon from './AnimatedIcon'

const VARIANTS = { normal: { x: 0 }, animate: { x: [0, -3, 0] } }

export default function BackArrowIcon(props) {
  return (
    <AnimatedIcon variants={VARIANTS} transition={{ duration: 0.3 }} {...props}>
      <path d="M19 12H5M12 5l-7 7 7 7" />
    </AnimatedIcon>
  )
}
