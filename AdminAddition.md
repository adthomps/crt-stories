Implement “Export on Publish” content flow for this Cloudflare Pages + Vite/React project.

CONTEXT
- Admin edits text content in D1 (Series, Books, Worlds, Characters).
- Public site currently reads src/content/*.json.
- Images remain static in /public/images and are managed manually via git.
- We want semi-automatic export: D1 -> JSON only when admin publishes/unpublishes.

REQUIREMENTS

1) Database
- Add D1 table:
  export_state(id=1, needs_export INTEGER, updated_at TEXT)
- Ensure a single row exists (id=1).
- On any publish or unpublish action:
  - set export_state.needs_export = 1
  - update updated_at

2) Admin API changes
- On POST /api/admin/{type}/:id/publish
- On POST /api/admin/{type}/:id/unpublish
- After updating entity status:
  - update export_state
- Continue writing audit_log entries.

3) Export Script
- Create scripts/export-d1-to-json.ts
- Script must:
  - Read export_state; exit immediately if needs_export = 0
  - Fetch ONLY published records from D1:
    series, books, worlds, characters
  - Map DB rows into existing JSON schemas used by the site
  - Write formatted JSON files:
    src/content/series.json
    src/content/books.json
    src/content/worlds.json
    src/content/characters.json
  - Maintain stable ordering to prevent noisy diffs
  - Compare file contents; only write if changed
  - If any file changed:
    - reset export_state.needs_export = 0
  - If nothing changed, leave flag as-is
- Use Cloudflare D1 REST API
- Read credentials from env:
  CF_API_TOKEN, CF_ACCOUNT_ID, D1_DATABASE_ID

4) GitHub Action
- Add .github/workflows/export-content.yml
- Triggers:
  - schedule (daily, e.g. 2am UTC)
  - workflow_dispatch (manual)
- Steps:
  - checkout repo
  - install deps
  - run export script
  - if git diff exists:
    - commit with message "chore: export published content"
    - push to main
- Use GitHub secrets for Cloudflare credentials.

5) Safety
- Export published content only
- Never export drafts
- Never overwrite JSON if unchanged
- Do not crash if export_state row is missing; initialize it if needed
- Log meaningful output for CI visibility

6) Documentation
- Update README with:
  - explanation of Export-on-Publish flow
  - required GitHub secrets
  - how to trigger manual export
  - how to recover if export_state is stuck

Implement this using existing repo structure and conventions.
