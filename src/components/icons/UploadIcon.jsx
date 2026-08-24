import AnimatedIcon from './AnimatedIcon'

const VARIANTS = { normal: { y: 0 }, animate: { y: [0, -4, 0] } }

export default function UploadIcon(props) {
  return (
    <AnimatedIcon variants={VARIANTS} transition={{ duration: 0.4 }} {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </AnimatedIcon>
  )
}
