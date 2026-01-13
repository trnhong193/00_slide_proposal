const path = require('path');
const { escapeHtml, getBackgroundRelPath } = require('./shared');

function generateDiagramHTML(slide, diagramPath, htmlDir, assetsDir, constants) {
  const bgPath = getBackgroundRelPath(htmlDir, assetsDir);
  const diagramRelPath = diagramPath ? path.relative(htmlDir, diagramPath) : null;

  const { SLIDE_WIDTH, SLIDE_HEIGHT, ACCENT_COLOR } = constants;

  return `<!DOCTYPE html>
<html>
<head>
<style>
html { background: #000000; }
body {
  width: ${SLIDE_WIDTH}pt;
  height: ${SLIDE_HEIGHT}pt;
  margin: 0;
  padding: 0;
  background-image: url('${bgPath}');
  background-size: cover;
  background-position: center;
  display: flex;
  flex-direction: column;
  font-family: Arial, Helvetica, sans-serif;
  overflow: hidden;
  min-height: 0;
}
.title {
  color: ${ACCENT_COLOR};
  font-size: 28pt;
  font-weight: bold;
  text-transform: uppercase;
  margin: 25pt 40pt 15pt 40pt;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
.diagram-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 40pt 72pt 40pt;
  overflow: hidden;
  min-height: 0;
  padding-bottom: 0;
}
img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
</style>
</head>
<body>
<h1 class="title">${escapeHtml(slide.title || '')}</h1>
<div class="diagram-container">
  ${diagramRelPath ? `<img src="${diagramRelPath}" alt="Diagram" />` : ''}
</div>
</body>
</html>`;
}

module.exports = { generateDiagramHTML };



