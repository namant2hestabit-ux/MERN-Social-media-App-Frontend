Frontend — MERN-APP
====================

Purpose
-------
This document is the professional, industry-style README for the frontend service of the MERN-APP project. It explains how to set up, run, test, and contribute to the frontend application (Vite + React).

Quick facts
-----------
- Stack: React (app uses React 19.x), Vite, Redux Toolkit, React Router
- Test runner: Vitest + Testing Library
- Linting: ESLint

Prerequisites
-------------
- Node.js 18+ (LTS recommended)
- npm 8+ (or yarn/pnpm if you prefer)

Getting started (development)
-----------------------------
1. Install dependencies

```bash
cd frontend
npm install --legacy-peer-deps
```

2. Start dev server

```bash
npm run dev
```

3. Open the app

Visit http://localhost:5173 (Vite default) — the backend API runs on http://localhost:5000 by default (see backend README).

Available npm scripts
---------------------
- `npm run dev` — start Vite dev server
- `npm run build` — build production assets into `dist`
- `npm run preview` — preview production build locally
- `npm run lint` — run ESLint
- `npm test` — run unit tests (Vitest)

Environment variables
---------------------
The frontend expects (if used) runtime environment variables. The project currently picks API base URL from internal configuration in `src/api/api.js`. If you add `.env` settings, use Vite conventions (VITE_ prefix) and document them here.

Project structure (top-level)
----------------------------
- `src/` — application source
  - `components/` — reusable UI components (Card, Navbar, Loader, Chat, Comments, CreatePost, Feed, MyPosts, Profile, etc.)
  - `pages/` — page-level components (Home, Login, Main, SinglePost, Admin)
  - `redux/` — Redux slices and store
  - `api/` — centralised API helpers (axios wrappers)
  - `assets/`, `public/` — images and static files
- `tests/` — unit tests (organized by `components` and `pages`)

Notes on components and modules
------------------------------
- Card: reusable post summary card used across feed and post lists.
- Loader: small spinner/loader used as fallback and during API calls.
- Navbar: header with navigation, logout, and user avatar.
- Feed: infinite/paginated list of posts. Uses API helpers.
- CreatePost: post creation UI; uses file uploads for images.
- Comments: comments list + create/edit/delete flows.
- Chat: real-time UI (uses socket.io client in runtime).

State management
----------------
- `redux/store.js` sets up the Redux store.
- `redux/authSlice.js` manages authentication state and persisted storage.

Testing
-------
The project uses Vitest + Testing Library for unit tests. Tests are located under `tests/components` and `tests/pages` and aim to validate UI rendering and component behavior.

Run tests

```bash
cd frontend
npm test
```

If you encounter peer dependency issues when installing testing libraries, use `--legacy-peer-deps` as shown earlier.

Test environment troubleshooting
-------------------------------
- Tests require a DOM-like environment. Vitest's `jsdom` environment must be enabled (the repo includes a `vitest.config.js` and a `tests/setupTests.js` file to register matchers).
- If tests fail to import components, ensure Vite resolves JSX files and that paths are correct.

Linting and formatting
----------------------
- ESLint is configured; run `npm run lint` to find issues.
- Prettier is not included by default; you may add it if desired.

Building for production
-----------------------
```bash
npm run build
```

Deploying
---------
- Build artifacts are in `dist/`. Serve with any static server (Netlify, Vercel, Surge, S3 + CloudFront, or a Node static server).
- Ensure backend API base URL in production environment points to the deployed backend.

CI recommendations
------------------
- Run `npm ci` or `npm install --legacy-peer-deps` on CI
- Run `npm test` and `npm run lint`
- Optionally build with `npm run build` to verify there are no compilation errors

Contributing
------------
- Follow existing coding style and component patterns
- Add unit tests for new components and critical behavior
- Update this README when adding new environment variables or changing critical scripts

Contact / Owner
----------------
- If you want me to expand the README with additional diagrams, component API docs, or to run and fix failing frontend tests, reply with which components/pages to prioritize.
