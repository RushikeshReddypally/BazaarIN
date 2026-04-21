import { createContext, useContext, useState, useCallback } from 'react'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [loginOpen, setLoginOpen] = useState(false)
  const [postOpen, setPostOpen] = useState(false)
  const [toast, setToast] = useState({ show: false, msg: '', icon: '✓' })
  const [activeCategory, setActiveCategory] = useState('all')

  const showToast = useCallback((msg, icon = '✓') => {
    setToast({ show: true, msg, icon })
    setTimeout(() => setToast(t => ({ ...t, show: false })), 3000)
  }, [])

  return (
    <AppContext.Provider value={{
      loginOpen, setLoginOpen,
      postOpen, setPostOpen,
      toast, showToast,
      activeCategory, setActiveCategory,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
