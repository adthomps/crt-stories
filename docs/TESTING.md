# CRT Stories: Testing

## Manual Testing
- Use the admin UI at `/worker` for CRUD
- Validate content changes by running `npm run build`
- Preview the site with `npm run preview`

## Automated Testing
- Playwright tests (if present) in `tests/`
- To run Playwright tests:
```bash
npx playwright test
```

## API Testing
- Postman collections in `tests/`
- Use Postman to run and validate API endpoints

---
For more, see README.md and BEST-PRACTICES.md.
