# CRT Stories: Reference Files

- `README.md`: Project overview, setup, workflow, and deployment
- `DESIGN-STYLE-GUIDE.md`: Unified design, architecture, and style conventions
- `ARCHITECTURE.md`: Project architecture, entity relationships, and build flow
- `BEST-PRACTICES.md`: Coding, UI, SEO, and collaboration best practices
- `src/config.ts`: Site-wide settings (title, author, baseUrl, etc.)
- `src/content/validation.ts`: Content schema and validation logic (Zod)
- `src/content/index.ts`: Content loader with validation
- `src/pages/Layout.css`: All layout, card, button, badge, and tag styles
- `src/pages/[entity]/index/+Page.tsx`: List pages for books, worlds, series, characters
- `src/pages/[entity]/@slug/+Page.tsx`: Detail pages for books, worlds, series, characters
- `src/pages/about/+Page.tsx`: About the Author page
- `src/content/author.json`: Author bio and metadata
- `src/content/books.json`, `worlds.json`, `series.json`, `characters.json`: Main content data (exported from D1)
- `scripts/export-d1-to-json.ts`: Automated export from D1 to JSON
- `.github/workflows/export-content.yml`: GitHub Action for automated content export

---

For more details on structure and conventions, see the DESIGN-STYLE-GUIDE.md and ARCHITECTURE.md.
