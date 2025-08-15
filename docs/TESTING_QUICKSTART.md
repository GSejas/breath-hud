# Testing Quickstart

This short guide helps contributors run the most important tests locally and points to the full testing documentation in the repo root.

Purpose
- Provide fast feedback for the breathing engine and core logic.
- Verify renderer wiring (UI) quickly using jsdom tests.
- Reserve slow E2E tests for CI or nightly runs.

Quick commands
- Install dev deps (once):

```powershell
npm install
```

- Run unit tests (engine, utils, main handlers):

```powershell
npm run test:unit
```

- Run renderer DOM tests (jsdom + Testing Library):

```powershell
npm run test:renderer
```

- Run full test suite (unit + renderer):

```powershell
npm test
```

- Run E2E smoke tests (Playwright - optional / CI):

```powershell
npm run test:e2e
```

Where to look for details
- Full strategy and examples: `TESTING.md` at repo root
- Jest configs: `jest.unit.config.js`, `jest.renderer.config.js` (project root)
- Example tests: `src/lib/__tests__`, `src/renderer/__tests__`
- Playwright e2e: `tests/e2e` (if present)

Quick notes
- Unit tests are fast; run them frequently during development.
- Renderer tests use `jsdom` and mock the `window.electronAPI` preload surface.
- E2E tests require the project to be built first (`npm run build`) and are best run in CI.

If you want, I can add the Jest configs and a starter unit test now and wire a CI job to run them on PRs.
