# CRT Stories: Internal API

## Overview
- All internal API endpoints are served from `/api/*` via Cloudflare Pages Functions in `functions/api/worker/`
- Used by admin UI for CRUD and content management

## Endpoints
- `/api/worker/books` – CRUD for books
- `/api/worker/worlds` – CRUD for worlds
- `/api/worker/characters` – CRUD for characters
- `/api/worker/series` – CRUD for series
- `/api/worker/auth` – Auth endpoints

## Conventions
- Only accessible to authenticated admin users
- Returns UI-specific view models
- Not for public consumption

---
For more, see PROJECT_RULES.md and src/content/validation.ts.
