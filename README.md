# yt-agentic-research-app

Research any topic on **YouTube** and get **structured insights in seconds**.
This agentic web app automates the heavy lifting: it finds the best videos, summarizes them with timestamps and confidence, and synthesizes a clean report with a TL;DR, themes, highlights, risks/opportunities, and next steps.

## Why it matters
- People waste hours hopping across videos to piece together an answer. This app delivers a single, reliable brief.
- The agentic loop (plan → execute → verify) reduces hallucinations, cross-checks sources, and focuses on what is useful.

## Core flow
1. Search – Finds relevant videos for your topic.
2. Summarize – Each video analyzed (key points, timestamps, confidence).
3. Synthesize – Overall report: TL;DR, themes, highlights, opportunities/risks, next steps.
4. Agent log – Transparent steps so results are auditable and repeatable.

## How to use
- Enter a topic and press Research.
- Watch results stream in: agent log, per-video digests, and a synthesized report.
- Share or refine the query.

## Tech stack
- Frontend: React + Vite + TypeScript
- Backend: Express + TypeScript
- LLM (optional): Google Gemini for higher-quality summaries
- Data: YouTube Search (video metadata) + application-level filtering

## Local development
\`\`\`bash
cp server/.env.example server/.env
cp client/.env.example client/.env
cd server && npm install && npm run dev
cd client && npm install && npm run dev
\`\`\`

## Docker
\`\`\`bash
docker compose up --build
\`\`\`

## Environment
- server/.env
  - GEMINI_API_KEY (optional)
  - GEMINI_MODEL (default: gemini-2.5-flash)
- client/.env
  - VITE_BACKEND_URL (default: http://localhost:4000)

## Repository layout
\`\`\`
/client
/server
.github/workflows/
README.md
LICENSE
.gitignore
\`\`\`

## Roadmap
- Multi-source research (papers, docs, blogs) with source weighting
- Citations view with time-stamped deep links
- Follow-up question mode that narrows to exactly what is needed

## License
MIT © 2025 Simon Yam
