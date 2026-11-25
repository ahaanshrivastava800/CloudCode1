# CloudCode

CloudCode is a mobile-first coding workspace built with Next.js. It combines a CodeMirror editor, a terminal-style output panel, language snippets, and a small-screen accessory bar. The project also includes IndexedDB helpers for local files, projects, execution logs, and a sync queue, plus a service worker for PWA caching.

> **Project status:** This repository is a prototype. The `/api/execute` route currently returns simulated output for C++, Rust, Go, and Java; it does not compile or run submitted code. Treat the execution endpoint as a demo, not as a secure production sandbox. Confirm client-side language support in the worker before relying on it.

## Features

- Responsive editor interface with JavaScript, Python, SQL, C++, Rust, Go, and Java language choices.
- CodeMirror-based editing, snippet library, and mobile keyboard accessory bar.
- Terminal-style panel for displaying execution results.
- Web Worker execution path and API routes for execution, files, projects, and execution logs.
- IndexedDB storage utilities and a sync queue for offline-oriented data handling.
- PWA manifest and service worker caching through `next-pwa`.

## Getting started

### Requirements

- Node.js 18 or newer
- npm

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in a browser.

To create and run a production build:

```bash
npm run build
npm start
```

The service worker is disabled during development by the Next PWA configuration. Check the app in a production build when working on install or offline behavior.

## Environment variables

The repository includes `.env.example` as a template. If you need local environment settings, copy it to `.env.local` and update the values for your setup. Most listed integrations (such as a database, analytics, and remote execution infrastructure) are not implemented by the current prototype, so setting those values alone does not enable them.

## Languages and execution

The interface offers JavaScript, Python, SQL, C++, Rust, Go, and Java. C++, Rust, Go, and Java are sent to `/api/execute`, whose current implementation simulates a successful run with example output. The route includes basic input checks and an in-memory rate counter, but it does not start the compilers or create an isolated sandbox.

JavaScript, Python, and SQL are routed through the client execution worker. Their actual runtime behavior depends on the code in `src/workers/execution.worker.ts` and its loaded runtime assets.

## Project layout

```text
src/
  app/                 Next.js pages, layout, and API routes
  components/           Editor, terminal, snippets, and mobile controls
  hooks/                Execution worker and sync hooks
  lib/                  CodeMirror setup and IndexedDB helpers
  workers/              Client-side execution worker
public/                 PWA assets, manifest, and service worker
ARCHITECTURE.md         Architecture notes
```

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Build the production app |
| `npm start` | Serve the production build |
| `npm run lint` | Run the configured Next.js lint command |
| `npm run generate-pwa` | Run the PWA generation script |

## Current limitations

- Remote execution is simulated; there is no compiler service or container isolation configured in this repository.
- The API routes and local sync helpers are prototype-level and do not provide account authentication or a production cloud database.
- PWA caching is configured in `next.config.js`; offline functionality should be checked in a production build and on target devices.

See [ARCHITECTURE.md](ARCHITECTURE.md) for the broader design notes.
