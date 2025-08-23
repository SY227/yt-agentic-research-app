# YouTube Agentic Research Web App

Research any topic on **YouTube** and get **structured insights in seconds**.
This agentic web app finds the best videos, summarizes them with timestamps and confidence, and synthesizes a clean report (TL;DR, themes, highlights, risks/opportunities, next steps).

## How to use
- Enter a topic and press Research; results stream in (agent log, per-video digests, synthesized report).

## Tech stack
- Frontend: React + Vite + TypeScript
- Backend: Express + TypeScript
- LLM (optional): Google Gemini

## Local development
```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
cd server && npm install && npm run dev   # http://localhost:4000
cd client && npm install && npm run dev   # http://localhost:5173
```

## Docker
```bash
docker compose up --build   # http://localhost:8080
```

## Environment
- Create a root `.env` with:
```bash
PORT=8787
YOUTUBE_API_KEY=""
GEMINI_API_KEY=""
MAX_VIDEOS=8
```
- `server/.env` (optional): `GEMINI_API_KEY`, `GEMINI_MODEL=gemini-2.5-flash`
- `client/.env`: `VITE_BACKEND_URL=http://localhost:4000`

## License
MIT © 2025 Simon Yam
