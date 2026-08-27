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

async function structuredResponse({ schema, instructions, input, language = 'en' }) {
  const languageInstruction = language === 'hi'
    ? 'Respond in simple, commonly understood Hindi. Do not use overly formal or Sanskritized language.'
    : 'Respond in clear, friendly English.'
  const response = await requireClient().chat.completions.create({
    model,
    temperature: 0.2,
    messages: [
      { role: 'system', content: `${commonRules}\n\n${languageInstruction}\n\n${instructions}\n\nReturn ONLY valid JSON matching this schema: ${JSON.stringify(schema)}. Do not include markdown or commentary outside JSON.` },
      { role: 'user', content: JSON.stringify(input) },
    ],
  })
  const text = response.choices?.[0]?.message?.content
  if (!text) throw new Error('The AI returned an empty response.')
  return parseJson(text)
}

export async function generateChecklist({ profile, documents, language }) {
  return structuredResponse({
    instructions: 'Create a practical, interactive document checklist specific to the citizen’s vehicle type, age, state and journey. Use only supplied mock documents; do not add rules. Every item must have a unique short id, a useful label, and a concise note. Set type to checklist.',
    input: { profile, mockDocuments: documents },
    language,
    schema: { type: 'object', additionalProperties: false, required: ['type', 'title', 'message', 'checklist'], properties: {
      type: { type: 'string', enum: ['checklist'] }, title: { type: 'string' },
      message: { type: 'string' },
      checklist: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'label', 'note'], properties: { id: { type: 'string' }, label: { type: 'string' }, note: { type: 'string' } } } },
    } },
  })
}

export async function explainOutcome({ code, profile, outcome, language }) {
  return structuredResponse({
    instructions: 'Explain this synthetic outcome with empathy. Give exactly one concrete next step grounded in the mock outcome.',
    input: { profile, mockOutcomeCode: code, mockOutcome: outcome },
    language,
    schema: { type: 'object', additionalProperties: false, required: ['message', 'nextStep'], properties: { message: { type: 'string' }, nextStep: { type: 'string' } } },
  })
}

export async function answerAssistant({ message, profile, outcome, slotPattern, language }) {
  return structuredResponse({
    instructions: 'Answer the citizen’s question directly and briefly. Ground the answer in the supplied synthetic profile, outcome, and slot pattern. If the data does not answer the question, say that the prototype does not have that information.',
    input: { citizenMessage: message, profile, mockOutcome: outcome, mockSlotPattern: slotPattern },
    language,
    schema: { type: 'object', additionalProperties: false, required: ['message'], properties: { message: { type: 'string' } } },
  })
}

export async function generateTransferChecklist({ transferType, documents, language }) {
  return structuredResponse({
    instructions: 'Create a clear, interactive synthetic ownership-transfer checklist. Make clear that supplied document names are mock examples and do not invent official requirements. Set type to checklist. Each item needs a unique short id, label, and concise note.',
    input: { transferType, mockDocuments: documents },
    language,
    schema: { type: 'object', additionalProperties: false, required: ['type', 'title', 'message', 'checklist'], properties: { type: { type: 'string', enum: ['checklist'] }, title: { type: 'string' }, message: { type: 'string' }, checklist: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['id', 'label', 'note'], properties: { id: { type: 'string' }, label: { type: 'string' }, note: { type: 'string' } } } } } },
  })
}

export async function explainChallanDispute({ challan, category, language }) {
  return structuredResponse({
    instructions: 'Give plain-language mock dispute guidance. Recommend evidence only from the supplied synthetic challenge category. Do not invent official steps, websites, contact details or deadlines.',
    input: { mockChallan: challan, disputeCategory: category },
    language,
    schema: { type: 'object', additionalProperties: false, required: ['message', 'evidence', 'nextStep'], properties: { message: { type: 'string' }, evidence: { type: 'array', items: { type: 'string' } }, nextStep: { type: 'string' } } },
  })
}

export async function routeCitizen({ message, language }) {
  return structuredResponse({
    instructions: 'Route the citizen to exactly one of driving_licence, rc_ownership, echallan, or assistant. Be decisive. Include a short next step. Use assistant only if no module can be identified.',
    input: { citizenMessage: message },
    language,
    schema: { type: 'object', additionalProperties: false, required: ['service', 'message', 'nextStep'], properties: { service: { type: 'string', enum: ['driving_licence', 'rc_ownership', 'echallan', 'assistant'] }, message: { type: 'string' }, nextStep: { type: 'string' } } },
  })
}
