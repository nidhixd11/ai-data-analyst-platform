# Backend

Python 3.11 + FastAPI + Pandas. This is where the API, ingestion pipeline, RAG engine, and LLM router live.

## Structure (to be created in upcoming tasks)
backend/
├── app/                 # FastAPI application entrypoint
├── api/                 # REST endpoints (/upload, /chat, /health)
├── rag/                 # RAG engine: prompt builder, retriever, router glue
├── retrieval/           # Keyword, aggregate, and embedding retrieval
├── embeddings/          # Gemini embeddings + FAISS index
├── router/              # LLM provider router + adapters
├── llm/                 # Provider adapters (Groq, Ollama, Gemini, OpenAI)
├── profiler/            # CSV/Excel schema & stats profiler
├── chunker/             # Row-window + column-summary chunking
├── aggregates/          # Pandas aggregate helpers
├── insights/            # Auto-insight generator
├── prompts/             # Prompt templates
├── sessions/            # In-memory session store
├── settings/            # Pydantic settings
├── logging/             # Loguru config + request-id middleware
└── tests/               # pytest suite

## Development setup

To be documented in T-106 onwards.

## Tasks owning code here

- **Nidhi**: API endpoints, ingestion, sessions, settings
- **Ashmita**: RAG engine, router, prompts, LLM adapters
- **Plabani**: Retrieval, embeddings, profiler, chunker, aggregates, insights
