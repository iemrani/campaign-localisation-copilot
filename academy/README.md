# Operations Hub Academy

Interactive tutorial and masterclass for the Lavazza Campaign Operations Hub.

This is a separate static web application. It does not read the main project at runtime. The content was generated from the current repo under `app/`, especially:

- `app/docs/architecture.md`
- `app/docs/deployment.md`
- `app/docs/microsoft-mapping.md`
- `app/docs/responsible-ai.md`
- `app/src/agents`
- `app/src/storage`
- `app/src/app/api`

## Run locally

```bash
cd copilot-academy
npm install
npm run dev
```

Open http://localhost:4173.

The app has no package dependencies, so `npm install` should complete without downloading application libraries.

## Build

```bash
npm run build
```

The static site is written to `dist/`. You can deploy that folder to Azure Static Web Apps, Netlify, Vercel static hosting, or any static file server.

## Design

- Static SPA with left navigation and hash routes.
- English and Italian flag dropdown, aligned with the main app language selector.
- Content stored in `src/content.js`.
- UI and diagrams implemented with plain HTML/CSS/JavaScript.
- Professional operations-hub training theme defined in `src/styles.css`.
- No backend, database, or LLM calls.
- Progress is stored in browser local storage.

To tweak the theme later, edit the `--academy-*` CSS variables at the top of
`src/styles.css`. See `ACADEMY_DESIGN.md` for the theme token map and isolation
notes.
The top bar includes a persistent light/dark toggle. The selected mode is stored
in browser `localStorage` under `academy.theme`.

## Site Map

1. Introduction
2. User Journeys
3. Architecture Overview
4. Operations Hub System Map
5. Data Model
6. Backend Workflows
7. Frontend Walkthrough
8. Azure Deployment & DevOps
9. Run & Deploy for Non-Technical Users
10. Learning Path
