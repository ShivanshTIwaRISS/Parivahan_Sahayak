import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'parivahan-sahayak-phase-1'
const emptyProfile = { name: '', age: '', state: '', city: '', vehicle: 'two-wheeler', journey: 'fresh', bookedSlot: '', demoOutcome: 'success' }
const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    try { return { ...emptyProfile, ...(JSON.parse(localStorage.getItem(STORAGE_KEY))?.profile || {}) } } catch { return emptyProfile }
  })
  const [locale, setLocale] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY))?.locale || 'en' } catch { return 'en' }
  })
  const [savedAt, setSavedAt] = useState(() => localStorage.getItem(STORAGE_KEY) ? Date.now() : null)
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ profile, locale }))
    setSavedAt(Date.now())
  }, [profile, locale])
  const updateProfile = (patch) => setProfile((current) => ({ ...current, ...patch }))
  const reset = () => { localStorage.removeItem(STORAGE_KEY); setProfile(emptyProfile); setLocale('en'); setSavedAt(null) }
  const value = useMemo(() => ({ profile, updateProfile, reset, savedAt, locale, setLocale }), [profile, savedAt, locale])
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
export const useApp = () => useContext(AppContext)
