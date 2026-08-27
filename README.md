# Parivahan Sahayak

Hackathon prototype that makes common transport journeys easier to understand: driving licences, vehicle RC ownership transfers, e-challans, and contextual AI help. It uses only synthetic local data and never contacts a government system.

## Run locally

```bash
npm install
cp .env.example .env
# Add GROQ_API_KEY to .env
npm run dev:full
```

Refresh mid-flow to confirm that the profile and language preference persist. Use the "Start over" button to clear the browser's saved demo state.

The app is at `http://localhost:5173`; the mock API runs at `http://localhost:8787`. Example endpoints: `GET /api/mock/documents?state=Maharashtra`, `GET /api/mock/slots?state=Maharashtra&city=Pune`, `GET /api/mock/rc?registration=MH12DEMO1234`, and `GET /api/mock/challan?number=CHL-DEMO-101`.

All Groq calls run only on the Express server. Without `GROQ_API_KEY`, the API safely returns a configuration message instead of a fabricated AI answer.

## Deploy to Vercel

Import this GitHub repository as a Vercel project. The included `vercel.json` serves the Vite app and maps `/api/*` to the serverless Express handler. Set `GROQ_API_KEY` (and optionally `GROQ_MODEL`) in **Project Settings → Environment Variables** before deploying. Never add `.env` to Git.
