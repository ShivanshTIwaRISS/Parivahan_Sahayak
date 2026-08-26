# Parivahan Sahayak

Hackathon prototype for a guided driving-licence journey. Phase 2 adds an Express mock API and a small data-access layer around synthetic JSON data. It never contacts any government system.

## Run locally

```bash
npm install
npm run dev:full
```

Refresh mid-flow to confirm saved profile data persists. Use the "Start over" button to clear the browser's saved demo state.

The app is at `http://localhost:5173`; the mock API runs at `http://localhost:8787`. Example endpoints: `GET /api/mock/documents?state=Maharashtra`, `GET /api/mock/slots?state=Maharashtra&city=Pune`, and `GET /api/mock/outcomes`.
