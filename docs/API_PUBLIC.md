# CRT Stories: Public API

## Overview
- All public API endpoints are served from `/v1/*` via Cloudflare Pages Functions in `functions/api/public/`
- Stable, versioned endpoints for public consumption

## Endpoints
- `/v1/books` – Public book data
- `/v1/worlds` – Public world data
- `/v1/characters` – Public character data
- `/v1/series` – Public series data

## Conventions
- No UI-specific logic or view models
- Must be stable and backward compatible

---
For more, see PROJECT_RULES.md and src/content/validation.ts.
