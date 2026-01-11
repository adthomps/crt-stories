# CRT Stories: Platform IDs & Environment Mapping

## Cloudflare Bindings
- D1: Used for admin CRUD and content export
- No KV, R2, or Queues currently in use

## Environment Variables
- `CF_API_TOKEN`, `CF_ACCOUNT_ID`, `D1_DATABASE_ID` for export scripts
- `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `ADMIN_EMAIL_FROM` for worker email

## Mapping
- See `.github/workflows/export-content.yml` for usage in CI
- See `scripts/export-d1-to-json.ts` for usage in export

---
For more, see DEPLOYMENT.md and worker/index.js.
