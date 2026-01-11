# AI Agent Contract for CRT Stories

This document defines the contract and guardrails for any AI agent or automation operating in this repository.

---

## Scope
- **Agents may only operate on content in `src/content/` and must pass all validation.**
- **No agent may modify application logic in `src/pages/`, `functions/`, or `scripts/` unless explicitly permitted.**
- **All content changes must pass build-time validation (`npm run build`).**
- **Agents must follow all conventions in `.github/copilot-instructions.md`, `BEST-PRACTICES.md`, and `DESIGN-STYLE-GUIDE.md`.**

## Required Behaviors
- **Content edits:**
  - Must preserve unique, valid slugs (see validation rules)
  - Must not introduce duplicate or missing required fields
  - Must update references (e.g., book slugs in worlds) if slugs change
- **Code edits:**
  - Only allowed in `src/content/validation.ts`, `src/content/validationSchemas.ts`, or `src/content/index.ts` for schema/validation improvements
  - All code changes must be type-safe and pass `npm run build`
- **Admin UI:**
  - Agents must not alter admin UI or authentication logic

## Prohibited Actions
- No direct writes to Cloudflare D1 or production data
- No changes to deployment, build, or workflow scripts
- No changes to `public/` assets except for new images referenced in content

## Audit & Logging
- All agent actions must be logged in PRs with a summary of changes and validation results
- PRs must reference this contract and the relevant validation files

---

For questions or exceptions, open an issue and tag a maintainer.