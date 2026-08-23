import AnimatedIcon from './AnimatedIcon'

const VARIANTS = { normal: { scale: 1 }, animate: { scale: [1, 1.12, 1] } }

export default function DocumentIcon(props) {
  return (
    <AnimatedIcon variants={VARIANTS} transition={{ duration: 0.35 }} {...props}>
      <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
    </AnimatedIcon>
  )
}
