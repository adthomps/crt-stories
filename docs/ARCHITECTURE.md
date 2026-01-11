# CRT Stories: Architecture

See root ARCHITECTURE.md for full details. This file is a placeholder for future architecture diagrams and deep dives.

- SPA: Vite + React + Vike SSG
- API: Cloudflare Workers (internal: /api/*, public: /v1/*)
- Data: Cloudflare D1 (admin), static JSON (frontend)
- Validation: Centralized in src/content/validation.ts

For more, see ../ARCHITECTURE.md and ../README.md.
