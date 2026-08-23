import AnimatedIcon from './AnimatedIcon'

const VARIANTS = { normal: { scale: 1, rotate: 0 }, animate: { scale: 1.05, rotate: [0, -7, 7, 0] } }

export default function SpeechBubbleIcon(props) {
  return (
    <AnimatedIcon variants={VARIANTS} transition={{ duration: 0.4 }} {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </AnimatedIcon>
  )
}
