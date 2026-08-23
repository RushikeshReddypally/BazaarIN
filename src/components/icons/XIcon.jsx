import AnimatedIcon from './AnimatedIcon'

const VARIANTS = { normal: { scale: 1, rotate: 0 }, animate: { scale: 1.15, rotate: -8 } }

export default function XIcon(props) {
  return (
    <AnimatedIcon variants={VARIANTS} transition={{ duration: 0.25 }} fill="currentColor" stroke="none" {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.91-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </AnimatedIcon>
  )
}
