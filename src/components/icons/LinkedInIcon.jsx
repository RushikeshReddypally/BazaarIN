import AnimatedIcon from './AnimatedIcon'

const VARIANTS = { normal: { scale: 1 }, animate: { scale: [1, 1.15, 1] } }

export default function LinkedInIcon(props) {
  return (
    <AnimatedIcon variants={VARIANTS} transition={{ duration: 0.35 }} fill="currentColor" stroke="none" {...props}>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
      <circle cx="4" cy="4" r="2" />
    </AnimatedIcon>
  )
}
