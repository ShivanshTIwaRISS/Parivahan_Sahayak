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

async function structuredResponse({ name, schema, instructions, input }) {
  const response = await requireClient().responses.create({
    model,
    instructions: `${commonRules}\n\n${instructions}`,
    input: JSON.stringify(input),
    text: { format: { type: 'json_schema', name, strict: true, schema } },
  })
  return JSON.parse(response.output_text)
}

export async function generateChecklist({ profile, documents }) {
  return structuredResponse({
    name: 'personalized_checklist',
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
    name: 'outcome_explanation',
    instructions: 'Explain this synthetic outcome with empathy. Give exactly one concrete next step grounded in the mock outcome.',
    input: { profile, mockOutcomeCode: code, mockOutcome: outcome },
    schema: { type: 'object', additionalProperties: false, required: ['message', 'nextStep'], properties: { message: { type: 'string' }, nextStep: { type: 'string' } } },
  })
}

export async function answerAssistant({ message, profile, outcome, slotPattern }) {
  return structuredResponse({
    name: 'assistant_answer',
    instructions: 'Answer the citizen’s question directly and briefly. Ground the answer in the supplied synthetic profile, outcome, and slot pattern. If the data does not answer the question, say that the prototype does not have that information.',
    input: { citizenMessage: message, profile, mockOutcome: outcome, mockSlotPattern: slotPattern },
    schema: { type: 'object', additionalProperties: false, required: ['message'], properties: { message: { type: 'string' } } },
  })
}
