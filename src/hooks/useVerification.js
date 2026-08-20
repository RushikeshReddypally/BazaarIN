import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useVerification(user) {
  const [profile, setProfile] = useState(null)
  const [verifiedUntil, setVerifiedUntil] = useState(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(() => {
    if (!user?.id) { setProfile(null); setVerifiedUntil(null); setLoading(false); return }
    setLoading(true)
    // profiles is now locked to the owner's own row (+ admin) — full profile only resolves for "self".
    // The verified_until RPC is a narrow, PII-free lookup that works for any user_id, so badges on
    // OTHER people's listings keep working without needing broad read access to profiles.
    Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.rpc('get_verified_until', { target_id: user.id }),
    ]).then(([profileRes, verifiedRes]) => {
      setProfile(profileRes.data ?? null)
      setVerifiedUntil(profileRes.data?.verified_until ?? verifiedRes.data ?? null)
      setLoading(false)
    })
  }, [user?.id])

  useEffect(() => { refresh() }, [refresh])

  const isVerified = !!verifiedUntil && new Date(verifiedUntil) > new Date()
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
