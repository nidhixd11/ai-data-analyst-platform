# Infrastructure

Docker, docker-compose, deployment configs, and provisioning scripts.

## Contents (to be created)
infra/
├── docker-compose.yml   # backend + frontend + ollama services (T-105)
├── backend.Dockerfile   # Multi-stage backend image (T-110)
├── frontend.Dockerfile  # Frontend production image
└── env/                 # Sample .env files (no secrets)

## Owners

- **Ashmita** — Docker, docker-compose
- **Nidhi** — CI/CD workflows (under `.github/workflows/`)