import AnimatedIcon from './AnimatedIcon'

const VARIANTS = { normal: { scale: 1 }, animate: { scale: [1, 1.15, 1] } }

export default function ImageIcon(props) {
  return (
    <AnimatedIcon variants={VARIANTS} transition={{ duration: 0.3 }} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" />
    </AnimatedIcon>
  )
}
