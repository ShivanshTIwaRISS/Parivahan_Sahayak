import OpenAI from 'openai'

const model = process.env.GROQ_MODEL || 'openai/gpt-oss-20b'
const client = process.env.GROQ_API_KEY ? new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
}) : null

const commonRules = `You are Parivahan Sahayak, a helpful assistant in a hackathon prototype.
Use only the profile and synthetic mock data in the request. Do not state or imply that any mock data is live, official, or verified.
Use plain, short language suitable for someone with limited digital literacy. Reply in the language used by the citizen (English or Hindi).
Never invent real government URLs, phone numbers, fees, policy rules, contacts, or application status. Do not request Aadhaar, PAN, payments, OTPs, or other sensitive information.`

function requireClient() {
  if (!client) {
    const error = new Error('GROQ_API_KEY is not configured on the server.')
    error.status = 503
    throw error
  }
  return client
}

function parseJson(text) {
  const cleaned = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim()
  try { return JSON.parse(cleaned) } catch {
    const error = new Error('The AI returned an unreadable response.')
    error.status = 502
    throw error
  }
}

async function structuredResponse({ schema, instructions, input }) {
  const response = await requireClient().chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      { role: 'system', content: `${commonRules}\n\n${instructions}\n\nReturn only valid JSON matching this schema: ${JSON.stringify(schema)}` },
      { role: 'user', content: JSON.stringify(input) },
    ],
  })
  const text = response.choices?.[0]?.message?.content
  if (!text) throw new Error('The AI returned an empty response.')
  return parseJson(text)
}

export async function generateChecklist({ profile, documents }) {
  return structuredResponse({
    instructions: 'Create a practical ordered checklist. Mention that document names are mock examples when they are supplied. Do not add rules not in the provided data.',
    input: { profile, mockDocuments: documents },
    schema: { type: 'object', additionalProperties: false, required: ['message', 'checklist'], properties: {
      message: { type: 'string' },
      checklist: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['order', 'text'], properties: { order: { type: 'integer' }, text: { type: 'string' } } } },
    } },
  })
}

export async function explainOutcome({ code, profile, outcome }) {
  return structuredResponse({
    instructions: 'Explain this synthetic outcome with empathy. Give exactly one concrete next step grounded in the mock outcome.',
    input: { profile, mockOutcomeCode: code, mockOutcome: outcome },
    schema: { type: 'object', additionalProperties: false, required: ['message', 'nextStep'], properties: { message: { type: 'string' }, nextStep: { type: 'string' } } },
  })
}

export async function answerAssistant({ message, profile, outcome, slotPattern }) {
  return structuredResponse({
    instructions: 'Answer the citizen’s question directly and briefly. Ground the answer in the supplied synthetic profile, outcome, and slot pattern. If the data does not answer the question, say that the prototype does not have that information.',
    input: { citizenMessage: message, profile, mockOutcome: outcome, mockSlotPattern: slotPattern },
    schema: { type: 'object', additionalProperties: false, required: ['message'], properties: { message: { type: 'string' } } },
  })
}

export async function generateTransferChecklist({ transferType, documents }) {
  return structuredResponse({
    instructions: 'Create a clear, ordered synthetic ownership-transfer checklist. Make clear that supplied document names are mock examples and do not invent official requirements.',
    input: { transferType, mockDocuments: documents },
    schema: { type: 'object', additionalProperties: false, required: ['message', 'checklist'], properties: { message: { type: 'string' }, checklist: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['order', 'text'], properties: { order: { type: 'integer' }, text: { type: 'string' } } } } } },
  })
}

export async function explainChallanDispute({ challan, category }) {
  return structuredResponse({
    instructions: 'Give plain-language mock dispute guidance. Recommend evidence only from the supplied synthetic challenge category. Do not invent official steps, websites, contact details or deadlines.',
    input: { mockChallan: challan, disputeCategory: category },
    schema: { type: 'object', additionalProperties: false, required: ['message', 'evidence', 'nextStep'], properties: { message: { type: 'string' }, evidence: { type: 'array', items: { type: 'string' } }, nextStep: { type: 'string' } } },
  })
}

export async function routeCitizen({ message }) {
  return structuredResponse({
    instructions: 'Route the citizen to exactly one of driving_licence, rc_ownership, echallan, or assistant. Be decisive. Include a short next step. Use assistant only if no module can be identified.',
    input: { citizenMessage: message },
    schema: { type: 'object', additionalProperties: false, required: ['service', 'message', 'nextStep'], properties: { service: { type: 'string', enum: ['driving_licence', 'rc_ownership', 'echallan', 'assistant'] }, message: { type: 'string' }, nextStep: { type: 'string' } } },
  })
}
