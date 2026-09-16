# Bymark｜留印

English · [中文](README.md)

Bymark is a personalized share-card generator designed for short-form writers. It doesn't write for you, and it doesn't speak for you — it takes the viewpoints, fragments, and feelings you have already written and lays them out as a share image that carries your personal mark. Avatar, byline, time, location, images, and layout all combine the way you want; export directly when you're done, and let your words travel with your identity. Less template, more human trace, so that when a single sentence goes out, people can tell who it came from.

## Preview

### Dark mode

![Bymark dark mode preview](docs/images/bymark-dark.png)

### Warm white mode

![Bymark warm white mode preview](docs/images/bymark-light.png)

### Pure white mode

![Bymark pure white mode preview](docs/images/bymark-white.png)

## Features

- Live editing and preview: body copy, author details, time, location, avatar, and images update the card immediately; the editor also includes undo, redo, and character metrics.
- Markdown writing: level 1/2 headings, quotes, unordered/ordered lists, bold, and italic are supported, with one-click plain-text copying.
- Carousel director: review every page's excerpt and text density, pin or restore page starts, and batch-export the full sequence.
- Publishing formats: `3:4`, `2:3`, `9:16`, and a Douyin cover mode with a safe-area guide in the preview.
- Scene image mode: use a full-bleed background with a fixed floating card and focused readability controls.
- High-resolution export: PNG or JPG at `1K`, `2K`, `3K`, or `4K` resolution, with one-click copying for the current page.
- Publish-ready action: opens the system share sheet when available, or copies the text and downloads the image package.
- Local drafts: drafts autosave in the browser and can be created, opened, renamed, deleted, or restored.
- Next issue: derive an independent draft that keeps the author and layout, then clears the copy and content imagery.
- Settings presets: save reusable author information, canvas, theme, and layout settings.
- Workspace backup: export the current work, drafts, and settings presets to JSON and merge them back into another browser.
- Three themes and responsive editing: dark, warm white, and pure white; both desktop and mobile can finish editing and exporting.

The first launch shows built-in sample copy, author details, and publishing settings. These are initialization values only and do not overwrite later local edits.

## Run locally

Prerequisites: the current Node.js LTS release and npm.

```bash
git clone <your-repository-url>
cd Bymark
npm install
npm run dev
```

Open the URL printed by the terminal, usually `http://localhost:5173`.

## Production build and deployment

Bymark is a static Vite application with no backend dependency. The build output is written to `dist/` and can be deployed to Vercel, Netlify, Cloudflare Pages, GitHub Pages, or any static file server.

```bash
npm run build
npm run preview
```

Typical platform settings:

| Platform | Build command | Output directory |
| --- | --- | --- |
| Vercel / Netlify / Cloudflare Pages | `npm run build` | `dist` |
| GitHub Pages | `npm run build` | `dist` |
| Self-hosted static server | Build locally, then upload `dist/` | `dist` |

There are no required environment variables or server APIs. If the app is deployed under a non-root path, configure Vite's `base` option and verify icon, Manifest, and asset URLs.

## Commands

```bash
# TypeScript check and production build
npm run build

# ESLint
npm run lint

# Unit checks
npm run unit

# Browser feature and UI regression checks
npm run qa

# Preview the production build
npm run preview
```

If Chromium is not installed locally, run:

```bash
npx playwright install chromium
```

QA can also target an already-running site:

```bash
BYMARK_URL=http://127.0.0.1:4173 npm run qa
```

## Stack

- Vue 3 + TypeScript
- Vite
- `html-to-image` for image export
- Lucide for interface icons
- Playwright for browser regression checks

## Project structure

```text
src/
  components/       editor, preview, draft, and template components
  App.tsx           app orchestration, autosave, pagination, and image export
  drafts.ts         IndexedDB draft storage and snapshot logic
  brandTemplates.ts local settings-preset storage
  markdown.tsx      Markdown rendering and plain-text copying
  pagination.ts     long-text pagination and manual page breaks
  workspace.ts      workspace backup format and merge logic
  bymark.ts         editor state, local settings, and image storage
public/             icons, default avatar, and PWA Manifest
docs/images/        README preview images
tests/              unit checks and browser QA
```

## Data and privacy

Bymark has no backend service. Settings are kept in browser `localStorage`; drafts, settings presets, and image assets use IndexedDB and stay in the current browser. Nothing is synced to the cloud automatically, and clearing site data removes local content, so use workspace backup for a portable copy.

Before deployment, verify:

- Production build, lint, unit checks, and QA all pass.
- The target platform serves all static assets from `dist/` correctly.
- Whether users need cross-device sync or cloud backup; the current release provides manual workspace backup, not cloud sync.
- If deploying under a subpath such as GitHub Pages, add the correct Vite `base` setting and verify asset URLs.

## License

Released under the [MIT License](LICENSE). Copyright © 2026 Rainxen.
