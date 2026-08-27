async function post(path, body) {
  const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const json = await response.json()
  if (!response.ok) throw new Error(json.error || 'Something went wrong.')
  return json
}
export const generateChecklist = (profile, language) => post('/api/generate-checklist', { profile, language })
export const explainOutcome = (profile, language) => post('/api/explain-outcome', { profile, language, code: profile.demoOutcome === 'failure' ? 'DOC_MISMATCH' : 'SUCCESS' })
export const assistantChat = (message, profile, language) => post('/api/assistant-chat', { message, profile, language })
export const generateRCChecklist = (transferType, language) => post('/api/generate-rc-checklist', { transferType, language })
export const explainChallanDispute = (number, category, language) => post('/api/explain-challan-dispute', { number, category, language })
export const routeService = (message, language) => post('/api/route-service', { message, language })
export const getMockRC = async (registration) => { const r = await fetch(`/api/mock/rc?registration=${encodeURIComponent(registration)}`); return (await r.json()).data }
export const getMockChallan = async (number) => { const r = await fetch(`/api/mock/challan?number=${encodeURIComponent(number)}`); return (await r.json()).data }
