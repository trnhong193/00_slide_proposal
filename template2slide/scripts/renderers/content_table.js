const { escapeHtml, getBackgroundRelPath } = require('./shared');

function generateContentTableHTML(slide, htmlDir, assetsDir, constants) {
  const bgPath = getBackgroundRelPath(htmlDir, assetsDir);
  const table = slide.table || {};
  const headers = table.headers || [];
  const rows = table.rows || [];

  const { SLIDE_WIDTH, SLIDE_HEIGHT, ACCENT_COLOR, TEXT_COLOR } = constants;

  let tableHTML = '<table style="width: 100%; border-collapse: collapse; margin: 0;">';

  if (headers.length > 0) {
    tableHTML += '<thead><tr>';
    headers.forEach(header => {
      tableHTML += `<th style="background: ${ACCENT_COLOR}; color: ${TEXT_COLOR}; padding: 8pt; text-align: left; font-weight: bold; border: 1px solid ${ACCENT_COLOR};">${escapeHtml(header)}</th>`;
    });
    tableHTML += '</tr></thead>';
  }

  tableHTML += '<tbody>';
  rows.forEach((row, index) => {
    const bgColor = index % 2 === 0 ? '#1a1a1a' : '#2a2a2a';
    tableHTML += '<tr>';
    row.forEach(cell => {
      tableHTML += `<td style="padding: 8pt; color: ${TEXT_COLOR}; border: 1px solid #444; background: ${bgColor}; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(String(cell))}</td>`;
    });
    tableHTML += '</tr>';
  });
  tableHTML += '</tbody></table>';

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
  font-size: 32pt;
  font-weight: bold;
  text-transform: uppercase;
  margin: 30pt 40pt 20pt 40pt;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
.content {
  flex: 1;
  margin: 0 40pt 72pt 40pt;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  padding-bottom: 0;
  max-height: 100%;
}
</style>
</head>
<body>
<h1 class="title">${escapeHtml(slide.title || '')}</h1>
<div class="content">
  ${tableHTML}
</div>
</body>
</html>`;
}

module.exports = { generateContentTableHTML };



