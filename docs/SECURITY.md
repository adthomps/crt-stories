# CRT Stories: Security

## Admin UI
- Only accessible at `/worker`, protected by authentication
- Do not expose admin endpoints publicly

## Secrets
- Never commit secrets to the repo
- Use environment variables for all API keys, DB IDs, etc.
- GitHub Actions secrets for CI/CD

## Validation
- All content is validated at build time; invalid content cannot be deployed

## Dependencies
- Keep dependencies up to date (see package.json)

---
For more, see PROJECT_RULES.md and DEPLOYMENT.md.
