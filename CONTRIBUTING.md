# Contributing

Welcome! This is the playbook for working on the Data Insights Chatbot. Read it before opening your first PR.
## Branch model

We use three long-lived branches and short-lived feature branches.
feature/T-XXX-short-name  →  dev  →  main

- **`main`** — production-ready. Only updated via signed releases. Never push directly.
- **`dev`** — integration branch. All feature work merges here first. Never push directly.
- **`feature/T-XXX-short-name`** — your working branch for one task. One feature branch per design-doc task ID.

### Branch naming

Format: `feature/<task-id>-<short-kebab-name>`

Examples:
- `feature/T-106-fastapi-health-endpoint`
- `feature/T-117-keyword-retriever`
- `feature/T-131-frontend-scaffold`

## Workflow for every change

1. Update `dev` locally:
git checkout dev
git pull
2. Branch off `dev`:
git checkout -b feature/T-XXX-short-name
3. Make your changes. Commit often with clear messages (see "Commit messages" below).
4. Push to GitHub:
git push -u origin feature/T-XXX-short-name
5. Open a Pull Request targeting `dev` (NOT `main`).
6. Fill out the PR template completely. Empty PRs get sent back.
7. Wait for review. CODEOWNERS auto-assigns the right reviewer.
8. Address review comments by pushing more commits to the same branch.
9. Once approved, the PR can be merged.
10. Delete the feature branch after merge.

## Commit messages

Use this format:
<Task-ID>: <Imperative summary>
<Optional body explaining why, not what>

Good examples:
- `T-106: Add /health endpoint with CORS`
- `T-117: Implement column-aware keyword retriever`
- `T-131: Scaffold Vite + React + Tailwind frontend`

Bad examples (will be rejected):
- `fixed stuff`
- `wip`
- `update`

## Pull Request rules

- Target `dev`, never `main`.
- One task per PR. If you're touching two unrelated areas, that's two PRs.
- Fill the entire PR template — the "How to test" section is non-negotiable.
- All CI checks must pass (once CI lands in T-139).
- Get at least 1 approval before merging.
- Use "Squash and merge" — keeps `dev` history clean.
- Delete the feature branch immediately after merging.

## Code style

### Backend (Python)
- Formatter: **black**
- Linter: **ruff**
- Type-checker: **mypy**
- All three run on every commit via pre-commit hooks (T-104).

### Frontend (TypeScript)
- Formatter: **prettier**
- Linter: **eslint**
- Both run on every commit via pre-commit hooks (T-104).

## Setting up locally

1. Clone the repo:
git clone git@github.com:nidhixd11/ai-data-analyst-platform.git
cd ai-data-analyst-platform
2. See `backend/README.md` and `frontend/README.md` for service-specific setup (coming in T-106 and T-131).

## Questions?

Ping the team channel before opening a PR if you're unsure about scope, naming, or which branch to target. Cheaper to ask than to redo.
