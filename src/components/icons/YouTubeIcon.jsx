import AnimatedIcon from './AnimatedIcon'

const VARIANTS = { normal: { scale: 1 }, animate: { scale: [1, 1.15, 1] } }

export default function YouTubeIcon(props) {
  return (
    <AnimatedIcon variants={VARIANTS} transition={{ duration: 0.35 }} fill="currentColor" stroke="none" {...props}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon fill="#fff" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </AnimatedIcon>
  )
}
