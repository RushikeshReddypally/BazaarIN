import AnimatedIcon from './AnimatedIcon'

const VARIANTS = { normal: { rotate: 0 }, animate: { rotate: [0, -10, 10, -10, 0] } }

export default function FlagIcon(props) {
  return (
    <AnimatedIcon variants={VARIANTS} transition={{ duration: 0.4 }} {...props}>
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" />
    </AnimatedIcon>
  )
}
