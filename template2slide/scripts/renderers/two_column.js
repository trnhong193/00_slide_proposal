const { escapeHtml, getBackgroundRelPath } = require('./shared');

function generateTwoColumnHTML(slide, htmlDir, assetsDir, constants) {
  const bgPath = getBackgroundRelPath(htmlDir, assetsDir);
  const leftContent = slide.left_column?.content || [];
  const rightContent = slide.right_column?.content || [];

  const { SLIDE_WIDTH, SLIDE_HEIGHT, ACCENT_COLOR, TEXT_COLOR } = constants;

  const totalItems = leftContent.length + rightContent.length;
  const fontSize = totalItems > 8 ? 10 : (totalItems > 6 ? 11 : 12);
  const marginBottom = totalItems > 8 ? 4 : (totalItems > 6 ? 6 : 8);

  const leftList = leftContent.map(item =>
    `<li style="margin-bottom: ${marginBottom}pt; font-size: ${fontSize}pt; color: ${TEXT_COLOR}; line-height: 1.3; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(item)}</li>`
  ).join('');

  const rightList = rightContent.map(item =>
    `<li style="margin-bottom: ${marginBottom}pt; font-size: ${fontSize}pt; color: ${TEXT_COLOR}; line-height: 1.3; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(item)}</li>`
  ).join('');

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
  font-size: 24pt;
  font-weight: bold;
  text-transform: uppercase;
  margin: 20pt 40pt 10pt 40pt;
  word-wrap: break-word;
  overflow-wrap: break-word;
  flex-shrink: 0;
}
.columns {
  flex: 1;
  display: flex;
  margin: 0 40pt 54pt 40pt;
  gap: 25pt;
  min-height: 0;
  overflow: hidden;
  padding-bottom: 0;
}
.column {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow: hidden;
}
.column-title {
  color: ${ACCENT_COLOR};
  font-size: 16pt;
  font-weight: bold;
  margin-bottom: 10pt;
  word-wrap: break-word;
  overflow-wrap: break-word;
  flex-shrink: 0;
}
.column-content {
  flex: 1;
  overflow: hidden;
  min-height: 0;
}
ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
</style>
</head>
<body>
<h1 class="title">${escapeHtml(slide.title || '')}</h1>
<div class="columns">
  <div class="column">
    <h2 class="column-title">${escapeHtml(slide.left_column?.title || '')}</h2>
    <div class="column-content">
      <ul>${leftList}</ul>
    </div>
  </div>
  <div class="column">
    <h2 class="column-title">${escapeHtml(slide.right_column?.title || '')}</h2>
    <div class="column-content">
      <ul>${rightList}</ul>
    </div>
  </div>
</div>
</body>
</html>`;
}

module.exports = { generateTwoColumnHTML };



