# Data Insights Chatbot — Phase 1

A lean, in-memory RAG prototype that turns any CSV or Excel upload into instant insights and natural-language Q&A.

Upload a CSV or Excel file (.csv, .xlsx, .xls) → see schema, stats, and auto-insights → ask questions in plain English → get grounded answers from your choice of LLM provider (Groq, Ollama, Gemini, ChatGPT).
## Status

🚧 Phase 1 — Active development. See `docs/` for the full design document and roadmap.

## Stack

- **Frontend**: React 18 + Vite + TypeScript + Tailwind
- **Backend**: Python 3.11 + FastAPI + Pandas
- **RAG**: Column-aware keyword retrieval → Pandas aggregates → sentence-transformers + FAISS
- **LLM router**: Groq · Ollama · Gemini · ChatGPT (interchangeable)
- **Infra**: Docker Compose for local dev

## Project layout
\.
├── backend/    # FastAPI service, RAG engine, LLM router
├── frontend/   # React UI: upload, dashboard, chat
├── infra/      # Docker Compose and deployment configs
├── docs/       # Design doc, ADRs, engineering notes
└── .github/    # CODEOWNERS, workflows, PR templates

## Local development

To be documented as the project bootstraps. See:

- `backend/README.md`
- `frontend/README.md`
- `infra/README.md`

## Contributing

See `CONTRIBUTING.md` (coming in T-103) for branch flow, commit conventions, and the PR process.

## Team

| Name      | Lane                                                                |
|-----------|---------------------------------------------------------------------|
| Nidhi     | Frontend, ingestion API, chat API, CI/CD                            |
| Ashmita   | RAG engine, LLM router, backend infra                               |
| Plabani   | Retrieval (L2/L3), embeddings, auto-insights, optional providers    |

## License

To be added in T-103.
