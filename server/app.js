import 'dotenv/config'
import express from 'express'
import { getAllOutcomes, getAllSlotPatterns, getDocuments, getOutcome, getSlotPattern } from './data/access.js'
import { answerAssistant, explainOutcome, generateChecklist } from './ai.js'

const app = express()
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true, mode: 'mock', aiProvider: 'Groq', disclaimer: 'Synthetic hackathon data only.' }))
app.get('/api/mock/documents', (req, res) => res.json({ data: getDocuments(req.query.state), mocked: true }))
app.get('/api/mock/slots', (req, res) => res.json({ data: req.query.state ? getSlotPattern(req.query.state, req.query.city) : getAllSlotPatterns(), mocked: true }))
app.get('/api/mock/outcomes', (_req, res) => res.json({ data: getAllOutcomes(), mocked: true }))

app.post('/api/generate-checklist', async (req, res, next) => {
  const { profile = {} } = req.body
  const licence = profile.journey === 'fresh' ? 'LL' : 'DL'
  const stateRules = getDocuments(profile.state)
  try {
    const ai = await generateChecklist({ profile, documents: stateRules?.[licence]?.[profile.vehicle] ?? [] })
    res.json({ ...ai, aiPowered: true, mockedData: true })
  } catch (error) { next(error) }
})
app.post('/api/explain-outcome', async (req, res, next) => {
  const item = getOutcome(req.body.code || 'SUCCESS')
  if (!item) return res.status(400).json({ error: 'Unknown mock outcome code.' })
  try {
    const ai = await explainOutcome({ code: req.body.code || 'SUCCESS', profile: req.body.profile ?? {}, outcome: item })
    res.json({ ...ai, outcome: item, aiPowered: true, mockedData: true })
  } catch (error) { next(error) }
})
app.post('/api/assistant-chat', async (req, res, next) => {
  const { profile = {}, message = '' } = req.body
  if (!message.trim()) return res.status(400).json({ error: 'Please enter a message.' })
  try {
    const outcome = getOutcome(profile.demoOutcome === 'failure' ? 'DOC_MISMATCH' : 'SUCCESS')
    const slotPattern = getSlotPattern(profile.state, profile.city)
    const ai = await answerAssistant({ message, profile, outcome, slotPattern })
    res.json({ ...ai, aiPowered: true, mockedData: true })
  } catch (error) { next(error) }
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(error.status || 500).json({ error: error.status === 503 ? error.message : 'The AI assistant could not respond right now. Please try again.' })
})

export default app
