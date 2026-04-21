import { useApp } from '../context/AppContext'

export default function Toast() {
  const { toast } = useApp()

  return (
    <div id="toast" className={toast.show ? 'show' : ''}>
      <div className="ti">{toast.icon}</div>
      {toast.msg}
    </div>
  )
}
