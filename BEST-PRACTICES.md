# CRT Stories: Best Practices

## Code & Content
- **Type Safety:** Use strict TypeScript interfaces for all content and config
- **Validation:** Enforce Zod validation at build time; build fails on any invalid content
- **Consistent Naming:** Use lowercase, hyphenated slugs; keep naming conventions consistent across all entities
- **No runtime SSR:** All logic must be compatible with static output (SSG only)

## UI & UX
- **Consistent UI:** Use shared CSS classes and patterns for all cards, buttons, badges, and tags
- **Accessibility:** Ensure all forms, buttons, and navigation are accessible (labels, aria attributes, keyboard navigation)
- **Responsive Design:** Test layouts on mobile, tablet, and desktop
- **Field-Level Validation:** Provide real-time feedback and friendly error messages in admin forms
- **Deduplication:** Always deduplicate relationship tags/badges in UI

## SEO & Performance
- **Meta Tags:** Define meta tags in each page's `+Head.tsx` (Open Graph, Twitter Cards, canonical URLs)
- **Image Optimization:** Use appropriately sized images; optimize for fast loading
- **Static Assets:** Store images and assets in `public/images/` and reference via relative paths

## Data & Deployment
- **Content Export:** Use automated scripts to sync published D1 records to frontend JSON
- **Build Validation:** Build must fail on missing fields, bad slugs, duplicate slugs, or invalid URLs/dates
- **Cloudflare Pages:** Deploy only static output; use D1 for admin CRUD and content management

## Collaboration
- **Documentation:** Keep README, DESIGN-STYLE-GUIDE.md, and ARCHITECTURE.md up to date
- **Code Reviews:** Review all PRs for type safety, validation, and UI consistency
- **Issue Tracking:** Use GitHub Issues for bugs, enhancements, and questions

---

Follow these best practices to ensure CRT Stories remains robust, maintainable, and user-friendly. For more details, see the DESIGN-STYLE-GUIDE.md and ARCHITECTURE.md.
