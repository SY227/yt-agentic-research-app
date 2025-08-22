--------------------------------------------------
# Earnings Debrief (Agentic) Web App

React + Express (TypeScript). Pulls transcripts, quotes, and news from FMP and (optionally) uses Gemini.
Now agentic: Planner → Executor → Verifier control loop with iterative re-planning.

## Quick Start
1) Put keys in `.env` at repo root:
   - FMP_API_KEY=...
   - (Optional) GEMINI_API_KEY=...
2) Run:
   ```bash
   docker compose up --build
   ```
3) Open http://localhost:8080

## Dev Mode (without Docker)
Server:
```bash
cd server
npm i
npm run dev
```
Client:
```bash
cd client
npm i
# create client/.env.local with VITE_BACKEND_URL=http://localhost:4000
npm run dev
```


