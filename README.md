# StudyAnalyzer AI

A bilingual, local-first study workspace. React + TypeScript + Vite, with IndexedDB persistence and explainable recommendations. Phase 1 requires no API key or server.

## Develop

Use Node.js 24 and pnpm 11.25.0:

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
```

Open the printed `/StudyAnalyzer/` URL. Hash routing supports direct navigation and reloads on GitHub Pages. The build output is `dist/`.

## Features

- Japanese/English interface independent of academic content; dark/light themes
- Mistake CRUD, searching, subject/category filtering
- Past paper CRUD, school/subject/year filters, five reflection fields
- Normalized score charts, mistake distribution, subject averages, date filters
- Explainable local recommendations with evidence counts and cautious possible causes
- Improvement goals, command palette, responsive navigation, reduced-motion support
- Versioned and validated JSON backups; atomic merge imports; confirmed deletion

## Privacy

All learning records and preferences stay in browser IndexedDB. No analytics tracker or remote AI service is used. Data does not sync across devices and can be lost when browser storage is cleared. Export backups regularly; backups contain your private records. Source code and synthetic unit-test fixtures are the only material committed to GitHub.

## GitHub Pages

Repository: https://github.com/haruhigh999-wq/StudyAnalyzer

In repository **Settings → Pages → Source**, choose **GitHub Actions**. Push to `main` to test, build, and deploy. Expected website: https://haruhigh999-wq.github.io/StudyAnalyzer/

Vite `base` is `/StudyAnalyzer/`. If renaming the repository, update it.

## Architecture and Phase 2

- `src/types`: Zod runtime schemas and inferred TypeScript types
- `src/data`: Dexie schema, transactional import/export and deletion
- `src/services/analysis.ts`: pure rule-based `AnalysisProvider` interface
- `src/i18n`: English/Japanese UI and advice resources
- `src/components`: accessible dialogs, record forms and responsive charts
- `src/App.tsx`: routing, workspace composition and record workflows
- `src/styles`: responsive theme and interaction tokens

Read `PROJECT_PROGRESS.md` before the next phase. Add a secure backend and explicit consent before introducing remote AI. Never place provider credentials in a Vite environment variable or the public bundle. Keep the local provider as an offline fallback. Preserve schema migrations, independently select explanation language, and test output evidence attribution.

Deployment guidance follows the [Vite static deployment documentation](https://vite.dev/guide/static-deploy.html#github-pages) and [GitHub custom Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
