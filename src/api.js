async function post(path, body) {
  const response = await fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  const json = await response.json()
  if (!response.ok) throw new Error(json.error || 'Something went wrong.')
  return json
}
export const generateChecklist = (profile) => post('/api/generate-checklist', { profile })
export const explainOutcome = (profile) => post('/api/explain-outcome', { profile, code: profile.demoOutcome === 'failure' ? 'DOC_MISMATCH' : 'SUCCESS' })
export const assistantChat = (message, profile) => post('/api/assistant-chat', { message, profile })
