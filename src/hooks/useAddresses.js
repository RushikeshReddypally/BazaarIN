import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAddresses(user) {
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    if (!user?.id) { setAddresses([]); setLoading(false); return }
    setLoading(true)
    supabase.from('addresses').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => { setAddresses(data || []); setLoading(false) })
  }, [user?.id])

  useEffect(() => { refresh() }, [refresh])

  async function addAddress(payload) {
    const { error } = await supabase.from('addresses').insert({ ...payload, user_id: user.id })
    if (!error) refresh()
    return { error }
  }

  async function updateAddress(id, payload) {
    const { error } = await supabase.from('addresses').update(payload).eq('id', id)
    if (!error) refresh()
    return { error }
  }

  async function deleteAddress(id) {
    const { error } = await supabase.from('addresses').delete().eq('id', id)
    if (!error) refresh()
    return { error }
  }

  async function setDefault(id) {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id)
    const { error } = await supabase.from('addresses').update({ is_default: true }).eq('id', id)
    if (!error) refresh()
    return { error }
  }

  return { addresses, loading, addAddress, updateAddress, deleteAddress, setDefault, refresh }
}
