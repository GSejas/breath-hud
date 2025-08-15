# Architecture (ASCII Art)

Repository architecture (high level):

```
+---------------------------------------------------------------+
|                        Electron App                           |
|                                                               |
|  +----------------+       +----------------+    +-----------+  |
|  |   main proc    |<----->|   preload.js   |<-->| renderer  |  |
|  | (src/main/)    | IPC   | (contextBridge)|    | (src/renderer)
|  | - BrowserWindow|       | - exposes API  |    | - app.ts  |  |
|  | - ipc handlers |       +----------------+    | - engine  |  |
|  +----------------+                             +-----------+  |
|         ^  ^                                               ^   |
|         |  |                                               |   |
|         |  | shared utils, types, config (src/shared/)      |   |
|         |  +-----------------------------------------------+ |   |
|         |                                                  | |   |
|  build: tsc -b tsconfig.build.json                         | |   |
|  generator: scripts/generate-renderer-html.js -> dist/     | |   |
+---------------------------------------------------------------+
```

Notes:
- `main` is Node-targeted and compiled to `dist/main`.
- `renderer` is DOM-targeted and compiled to `dist/renderer`.
- A small generator creates `dist/renderer/index.html` referencing `app.js`.
- `src/shared` holds config manager and types used by both processes.
