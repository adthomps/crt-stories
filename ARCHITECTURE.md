# CRT Stories: Project Architecture

CRT Stories is a static-first author platform built with Vite, React, TypeScript, and Vike (SSG), with Cloudflare Pages Functions used for API capabilities.

## Core Principles

### Monorepo by Default
Shared code, unified tooling, and atomic commits are handled in a single repository.

### Static-First, API-Optional
Public pages are statically generated from JSON content. API usage is additive for admin and publish workflows, not a requirement for public rendering.

### Boundaries Over Flexibility
Clear boundaries between frontend (`src/`), backend (`functions/`), and scripts (`scripts/`) prevent accidental coupling.

### Docs as Code
Architecture and guardrail decisions are version-controlled in repository docs and reviewed with normal PR workflows.

### AI-Aware From Day One
Agent behavior and scope are explicitly documented in `AGENTS.md` and `.github/copilot-instructions.md`.

### Reproducible Deploys
Builds are tied to commits through package lockfiles and GitHub workflow execution.

### Frontend/Backend Boundaries
Client and server concerns are separated with explicit responsibilities and constraints.

## Frontend/Backend Boundaries

### Frontend (Vite + React + TypeScript + Vike)
**Responsibilities**
- UI rendering and state handling
- Route handling and navigation
- API calls through page/service logic
- Asset bundling and optimization

**Constraints**
- No direct database access
- No secrets in client code
- No backend-only business logic embedded in presentational components

### Backend (Cloudflare Workers + Hono-compatible handlers)
**Responsibilities**
- API endpoints under `/api/*`
- Authentication and authorization for admin workflows
- Database queries and mutations (D1)
- External service integrations (for example export/publish tooling)

**Constraints**
- No UI rendering
- No persistent client-side state
- Stateless per-request execution model

## Architectural Patterns

### Monorepo Layout
Unified codebase with explicit boundaries between deployables and shared code.

**Hard Rules**
- No deployable application logic at repository root
- Deployable units live in `src/` and `functions/`
- Shared validation and types live in `src/content/`
- Docs live in version control near implementation

**When to Apply**
- Default for this repository and any multi-surface author platform changes

### Frontend/Backend Split
Clear separation between client and server concerns.

**Hard Rules**
- Prefer no direct `fetch` calls in presentational components
- API endpoints live under `/api/*`
- Validation occurs at boundaries (`src/content/validation.ts`)
- Shared data contracts are versioned in repository code

**When to Apply**
- Any change touching admin API, public API, or page data loading

### AI Prompt Ownership
Prompt instructions are treated as versioned architecture artifacts.

**Hard Rules**
- Agent prompts/instructions are stored in repository (`AGENTS.md`, `.github/copilot-instructions.md`)
- Each prompt source has a clear owner in code review history
- AI-routed behavior must be explicit and auditable
- AI flows do not bypass authentication or validation

**When to Apply**
- Every agent-assisted change

### CI/CD Pipeline
Automated and reproducible deployments from version control.

**Hard Rules**
- PRs must run validation/build checks
- Main branch is deployable to staging/production targets via automation
- Release workflows are commit-based and traceable
- No manual production-only snowflake steps

**When to Apply**
- Every deploy path

### Branch Protection
Quality gates before merge/deploy.

**Hard Rules**
- Require PR reviews
- Require passing status checks
- Prefer squash merge for linear history
- No force push on protected branches

**When to Apply**
- All protected branches, especially production-bound branches

## Build & Deployment Flow

1. Admin UI writes changes to Cloudflare D1
2. Export script syncs published D1 records to `src/content/`
3. Build runs validation and static generation
4. Static assets are deployed to Cloudflare Pages

## Reference Files

- `PROJECT_RULES.md`
- `AGENTS.md`
- `.github/copilot-instructions.md`
- `src/content/validation.ts`
- `docs/DEPLOYMENT.md`
