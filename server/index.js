import express from 'express'
import { getAllOutcomes, getAllSlotPatterns, getDocuments, getOutcome, getSlotPattern } from './data/access.js'

const app = express()
const port = process.env.PORT || 8787
app.use(express.json())

app.get('/api/health', (_req, res) => res.json({ ok: true, mode: 'mock', disclaimer: 'Synthetic hackathon data only.' }))
app.get('/api/mock/documents', (req, res) => res.json({ data: getDocuments(req.query.state), mocked: true }))
app.get('/api/mock/slots', (req, res) => res.json({ data: req.query.state ? getSlotPattern(req.query.state, req.query.city) : getAllSlotPatterns(), mocked: true }))
app.get('/api/mock/outcomes', (_req, res) => res.json({ data: getAllOutcomes(), mocked: true }))

// Phase 2 response shapes: deliberately deterministic placeholders until Phase 3 adds OpenAI.
app.post('/api/generate-checklist', (req, res) => {
  const { profile = {} } = req.body
  const licence = profile.journey === 'fresh' ? 'LL' : 'DL'
  const stateRules = getDocuments(profile.state)
  const items = stateRules?.[licence]?.[profile.vehicle] ?? ['Complete your mock profile', 'Choose a mock slot']
  res.json({ message: `Mock checklist for ${profile.name || 'applicant'}. AI personalization is coming in Phase 3.`, checklist: items.map((text, index) => ({ order: index + 1, text, complete: false })), mocked: true })
})
app.post('/api/explain-outcome', (req, res) => {
  const item = getOutcome(req.body.code || 'SUCCESS')
  if (!item) return res.status(400).json({ error: 'Unknown mock outcome code.' })
  res.json({ message: item.description, outcome: item, mocked: true })
})
app.post('/api/assistant-chat', (req, res) => {
  const { profile = {} } = req.body
  res.json({ message: `This is a mock assistant response for ${profile.name || 'you'}. Context-aware AI answers will be enabled in Phase 3.`, mocked: true })
})

app.listen(port, () => console.log(`Mock API listening on http://localhost:${port}`))
