# Testing Guide — Breathing HUD

This document describes a practical, maintainable testing approach for the Breathing HUD Electron + TypeScript project. It covers test goals, recommended tools, example configs, npm scripts, CI, and small code examples you can adopt or extend.

## Preamble
Goal: fast, deterministic unit tests for core logic, reliable integration tests for preload/IPCs, focused renderer DOM tests without a full Electron run, and a small set of E2E smoke tests for critical flows.

Checklist
- [ ] Unit tests for core lib (breathing engine, pattern math)
- [ ] Integration tests for preload & IPC handlers
- [ ] DOM/renderer tests for UI wiring using jsdom + Testing Library
- [ ] Small E2E smoke tests using Playwright (Electron runner)
- [ ] CI job to run lint, typecheck, unit tests, integration tests (E2E optional)

---

## Recommended tools
- Unit + integration: Jest + ts-jest
- DOM testing: @testing-library/dom (or @testing-library/react if you use a framework)
- E2E: Playwright (Electron support)
- Mocks + test doubles: jest.mock, manual dependency injection
- Coverage: jest --coverage

Dev dependencies to add (suggested):

```powershell
npm install --save-dev jest ts-jest @types/jest jest-environment-jsdom @testing-library/dom
npm install --save-dev playwright # for E2E (optional, large)
```

Notes: pin versions to match your Node/Electron toolchain if necessary.

---

## Project test layout (suggested)
```
src/
  lib/                # engine + logic
    __tests__/        # unit tests for engine
  main/               # main process code
    __tests__/        # tests for IPC handlers (unit/integration)
  renderer/           # UI and DOM code
    __tests__/        # jsdom-based renderer tests
tests/                # optional e2e folder (playwright)
jest.config.js        # jest configuration (unit/integration)
playwright.config.ts  # playwright configuration (if using Playwright)
```

---

## npm scripts
Add these to `package.json` scripts (adjust existing scripts to avoid collisions):

```json
{
  "scripts": {
    "test": "npm run test:unit",
    "test:unit": "jest --config jest.unit.config.js",
    "test:integration": "jest --config jest.integration.config.js",
    "test:renderer": "jest --config jest.renderer.config.js",
    "test:e2e": "playwright test",
    "test:coverage": "jest --coverage",
    "check": "tsc --noEmit && npm run lint"
  }
}
```

You already have `build` and `dev` scripts; keep those and add the above. If `test` or `check` collides with your CI flows, merge appropriately.

---

## Jest configuration examples
Create `jest.unit.config.js` for engine/main unit tests:

```js
// jest.unit.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src/lib', '<rootDir>/src/main'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: { '^.+\\.ts$': 'ts-jest' },
  collectCoverageFrom: ['src/lib/**/*.ts', '!src/lib/**/__tests__/**'],
  coverageThreshold: {
    global: { branches: 75, functions: 80, lines: 80, statements: 80 }
  }
};
```

Create `jest.renderer.config.js` for renderer DOM tests (jsdom):

```js
// jest.renderer.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src/renderer'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect']
};
```

If you want separate integration config, make a `jest.integration.config.js` that targets `src/main/__tests__` and `src/shared` and uses `testEnvironment: 'node'`.

---

## Example unit test for the breathing engine
Place in `src/lib/__tests__/engine.test.ts` (adjust imports to match your engine code):

```ts
import { BreathingEngine } from '../engine';

describe('BreathingEngine', () => {
  test('calculates phases and advances time', () => {
    // Prefer injecting a deterministic time source into the engine for testability
    const now = { value: 0 };
    const timeSource = () => now.value;

    const engine = new BreathingEngine({ timeSource });
    const callback = jest.fn();
    engine.onPhaseChange(callback);

    engine.setPattern({ id: 'test', phases: [{ name: 'inhale', duration: 1, intensity: 1 }, { name: 'exhale', duration: 1, intensity: 1 }] });
    engine.start();

    // advance time by 1100ms (engine should progress) — use ms or seconds per your engine API
    now.value += 1100;
    engine._tick?.(); // call internal tick or expose a test hook

    expect(callback).toHaveBeenCalled();
    engine.stop();
  });
});
```

Notes:
- If the engine currently uses `performance.now()` internally, either switch to an injectable time source or mock `performance.now` in the test using `jest.spyOn(performance, 'now').mockImplementation(() => nowValue)`.
- Avoid relying on `setTimeout` real waits in unit tests.

---

## Renderer tests (jsdom + Testing Library)
Example: `src/renderer/__tests__/ui.test.ts`

```ts
import { render, screen, fireEvent } from '@testing-library/dom';
import '@testing-library/jest-dom';
import fs from 'fs';

// Load a minimal HTML template used by your renderer
const html = fs.readFileSync('dist/renderer/index.html', 'utf8');

describe('HUD renderer UI', () => {
  beforeEach(() => {
    document.body.innerHTML = html;
    // Provide a mock preload API
    (window as any).electronAPI = {
      loadConfig: jest.fn().mockResolvedValue({ /* minimal config */ }),
      startBreathing: jest.fn(),
      stopBreathing: jest.fn()
    };
  });

  test('start button toggles engine', async () => {
    const startBtn = document.getElementById('start-btn');
    expect(startBtn).toBeInTheDocument();
    fireEvent.click(startBtn!);
    expect((window as any).electronAPI.startBreathing).toHaveBeenCalled();
  });
});
```

Notes:
- JS DOM can’t render CSS or run real animations, but tests that assert DOM wiring and event handler calls are effective and fast.

---

## Preload & IPC handler tests
- Unit test `src/main/ipc-handlers.ts` by mocking `ConfigManager.loadConfig()` and a `HudApplication` stub with a `getMainWindow()` that returns a fake `webContents` with `.send()` stubbed.
- Use `jest.mock('electron', ...)` to intercept `ipcMain.handle` and assert handlers registered.

Example concept (pseudocode):

```ts
jest.mock('../shared/config-manager', () => ({ ConfigManager: { loadConfig: jest.fn().mockReturnValue({ /* ... */}) } }));

// require the module that registers handlers
const handlers = require('../main/ipc-handlers');
// ensure it called ipcMain.handle with expected channels
```

---

## E2E tests with Playwright (Electron)
- Use Playwright's Electron API (`_electron.launch`) to start the app from the built `dist` folder. Keep these tests minimal (Start/Stop, Pin/unpin, settings persist).
- Keep no more than 3–6 E2E tests to limit CI time.

Example Playwright test (sketch):

```ts
import { _electron as electron } from 'playwright';
import { expect } from '@playwright/test';

(async () => {
  const app = await electron.launch({ args: ['.'] });
  const win = await app.firstWindow();
  await expect(win.locator('#breathing-canvas')).toBeVisible();
  await app.close();
})();
```

Important: run `npm run build` before launching E2E tests in CI.

---

## CI (GitHub Actions) — example pipeline
Create `.github/workflows/tests.yml` that runs on PRs:

```yaml
name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node
        uses: actions/setup-node@v3
        with: node-version: '18'
      - name: Install
        run: npm ci
      - name: Lint & Typecheck
        run: npm run check
      - name: Unit tests
        run: npm run test:unit
      - name: Renderer tests
        run: npm run test:renderer
      # Optional E2E on a specific runner or nightly
      # - name: E2E (Playwright)
      #   run: npm run test:e2e
```

Notes: Keep E2E off on every PR unless necessary — run nightly or on release tags to preserve CI minutes.

---

## Testability improvements to consider
- Inject time source into the breathing engine (preferred) instead of reading `performance.now()` directly. This makes time-based tests deterministic.
- Expose a test hook on the engine to step its internal tick without starting rAF loops.
- Make `ConfigManager` accept an override path to load configuration from a test fixture.
- Provide a small `tests/utils/createRendererRoot()` to mount `index.html` fixture into jsdom for renderer tests.

---

## Pitfalls and common problems
- Flaky E2E tests: isolate and limit them. Mock external dependencies where possible.
- Too many slow tests: enforce fast unit test coverage and minimal E2E smoke tests.
- Testing electron internals: avoid testing electron runtime internals; test your wrappers and logic.

---

## Next steps I can implement for you
- Add Jest + ts-jest configuration files and one starter unit test for `src/lib/engine.ts`, plus update `package.json` scripts; then run the test locally and show results.
- Scaffold Playwright E2E with one smoke test that launches the built app (requires build in CI).

Tell me which starter you want me to implement (Jest unit harness or Playwright E2E scaffold) and I will create the files and run the tests.
