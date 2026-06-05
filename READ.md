# 🥘 Smart Pantry & Recipe Generator

Reduce food waste, save money, and cook from what you already own.

## Monorepo layout
- `backend/`  — FastAPI service (Python 3.12, Postgres + pgvector)
- `mobile/`   — Expo React Native app (TypeScript)
- `infra/`    — Docker, Compose, CI/CD, IaC
- `docs/`     — Architecture docs & ADRs

## Quick start (dev)
> Filled in over Steps 2–3.
```bash
docker compose -f infra/docker/compose.dev.yml up
```

## Tech stack
React Native (Expo) · FastAPI · PostgreSQL + pgvector · JWT auth · AWS (ECS Fargate)

## Contributing
See [CONTRIBUTING.md](./CONTRIBUTING.md). Commits follow Conventional Commits.