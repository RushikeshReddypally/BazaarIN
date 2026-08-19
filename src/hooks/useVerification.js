import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useVerification(user) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    if (!user?.id) { setProfile(null); setLoading(false); return }
    setLoading(true)
    supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
      .then(({ data }) => { setProfile(data); setLoading(false) })
  }, [user?.id])

  useEffect(() => { refresh() }, [refresh])

  const isVerified = !!profile?.verified_until && new Date(profile.verified_until) > new Date()
  const isPending = !!profile?.verification_requested_at && !isVerified

  async function requestVerification(extra = {}) {
    if (!user) return { error: new Error('Not signed in') }
    const { error } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      verification_requested_at: new Date().toISOString(),
      ...extra,
    })
    if (!error) refresh()
    return { error }
  }

  return { profile, loading, isVerified, isPending, requestVerification, refresh }
}
