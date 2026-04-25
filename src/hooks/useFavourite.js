import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../context/AppContext'

export function useFavourite(listingId, user) {
  const { changeSavedCount } = useApp()
  const [saved, setSaved] = useState(false)
  const [toggling, setToggling] = useState(false)

  useEffect(() => {
    if (!user || !listingId) { setSaved(false); return }
    supabase
      .from('favourites')
      .select('id')
      .eq('user_id', user.id)
      .eq('listing_id', listingId)
      .maybeSingle()
      .then(({ data }) => setSaved(!!data))
  }, [listingId, user])

  async function toggle() {
    if (!user || toggling) return
    setToggling(true)
    if (saved) {
      await supabase.from('favourites').delete().eq('user_id', user.id).eq('listing_id', listingId)
      setSaved(false)
      changeSavedCount(-1)
    } else {
      await supabase.from('favourites').insert({ user_id: user.id, listing_id: listingId })
      setSaved(true)
      changeSavedCount(+1)
    }
    setToggling(false)
    return !saved
  }

  return { saved, toggle, toggling }
}
