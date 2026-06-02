# Diagram sources

This folder holds the editable source files for every diagram in the design document. Diagrams are written in [Mermaid](https://mermaid.js.org/) (`.mmd` files) so they stay version-controlled and reviewable in pull requests, instead of being binary images that drift from the spec.

## Why source files, not images
The v2.0 design document only contains rendered diagram images, not the source code, per the rule that source belongs in the repo and not in the design doc. CI renders each `.mmd` file to PNG on every merge to `dev`, so the visuals embedded in the design document never go stale.

## Files

| File | Diagram |
|---|---|
| `phase1-system-architecture.mmd` | Phase 1 system architecture (Frontend → FastAPI → RAG → Router → LLMs) |
| `phase1-upload-sequence.mmd` | Phase 1 upload + query sequence |
| `phase1-rag-flow.mmd` | Phase 1 RAG pipeline flow |
| `phase2-db-sequence.mmd` | Phase 2 live-database NL-to-SQL sequence |
| `git-branch-model.mmd` | Branch promotion model (feature → dev → pre-prod → prod) |

## Editing
1. Open the `.mmd` file you want to change.
2. Edit the Mermaid syntax. The [Mermaid live editor](https://mermaid.live/) is useful for previewing changes.
3. Open a PR. CI will re-render the PNGs and update the embedded images in the design document.

## Rendering locally (optional)
If you want to preview a diagram as a PNG before pushing:

```bash
# install mermaid-cli once
npm install -g @mermaid-js/mermaid-cli

# render a single file
mmdc -i docs/diagrams/phase1-rag-flow.mmd -o phase1-rag-flow.png -t default -b white -s 3
```
