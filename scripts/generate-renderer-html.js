const fs = require('fs');
const path = require('path');

const distRenderer = path.join(__dirname, '..', 'dist', 'renderer');
const indexPath = path.join(distRenderer, 'index.html');

fs.mkdirSync(distRenderer, { recursive: true });

const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Breathing HUD</title>
  </head>
  <body>
    <div id="hud-container">
      <div id="breathing-canvas"></div>
      <div class="hud-controls">
        <button id="pin-btn">📌</button>
        <button id="audio-btn">🔊</button>
        <button id="close-btn">✖</button>
      </div>
      <div id="status">Breathing</div>
    </div>
    <script type="module" src="./app.js"></script>
  </body>
</html>`;

fs.writeFileSync(indexPath, html, 'utf8');
console.log('Wrote', indexPath);
