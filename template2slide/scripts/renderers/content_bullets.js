const fs = require('fs');
const path = require('path');
const { escapeHtml, getBackgroundRelPath, getRefDir } = require('./shared');

function generateContentBulletsHTML(slide, htmlDir, assetsDir, constants) {
  const bgPath = getBackgroundRelPath(htmlDir, assetsDir);
  const content = slide.content || [];

  const { SLIDE_WIDTH, SLIDE_HEIGHT, ACCENT_COLOR, TEXT_COLOR } = constants;

  // Check if this is System Requirements slide to add images
  const isSystemRequirements = slide.title && slide.title.toLowerCase().includes('system requirements');
  // template2slide/ref (NOT repo root /ref)
  const refDir = getRefDir();

  let listHTML = '<ul style="list-style-type: none; padding: 0; margin: 0;">';

  content.forEach((item) => {
    const level = item.level || 0;
    const text = item.text || '';
    if (text === '---') return; // Skip separator lines

    const colonIndex = text.indexOf(':');
    let formattedText = '';
    let isNetworkSection = false;
    let isCameraSection = false;

    if (colonIndex > 0) {
      const key = text.substring(0, colonIndex).trim();
      const value = text.substring(colonIndex + 1).trim();
      formattedText = `<span style="color: ${ACCENT_COLOR}; font-weight: bold;">${escapeHtml(key)}:</span> ${escapeHtml(value)}`;
    } else if (level === 0 && text && !text.includes(':')) {
      isNetworkSection = text.trim() === 'Network';
      isCameraSection = text.trim() === 'Camera';
      formattedText = `<span style="color: ${ACCENT_COLOR}; font-weight: bold; font-size: 15pt;">${escapeHtml(text)}</span>`;
    } else {
      formattedText = escapeHtml(text);
    }

    const indent = level * 18;
    const contentLength = content.length;
    const baseFontSize = isSystemRequirements
      ? (contentLength > 10 ? 11 : (contentLength > 8 ? 12 : 13))
      : (contentLength > 15 ? 12 : (contentLength > 10 ? 13 : 14));

    const isSectionTitle = level === 0 && text && !text.includes(':') &&
      ['Network', 'Camera', 'AI Training', 'AI Inference', 'Dashboard'].includes(text.trim());

    const fontSize = isSectionTitle ? '15pt' : (level === 0 ? `${baseFontSize}pt` : `${Math.max(10, baseFontSize - 2)}pt`);
    const marginBottom = isSectionTitle ? '6pt' : '2pt';
    const lineHeight = isSystemRequirements ? '1.15' : '1.25';

    // Icons for System Requirements sections (optional)
    let iconBeforeText = '';
    if (isSystemRequirements && isNetworkSection) {
      const networkImagePath = path.join(refDir, 'network.png');
      if (fs.existsSync(networkImagePath)) {
        const networkImageRel = path.relative(htmlDir, networkImagePath);
        iconBeforeText = `<img src="${networkImageRel}" alt="Network" style="width: 24pt; height: 24pt; object-fit: contain; vertical-align: middle; margin-right: 8pt; display: inline-block;" />`;
      }
    } else if (isSystemRequirements && isCameraSection) {
      const cameraImagePath = path.join(refDir, 'camera.png');
      if (fs.existsSync(cameraImagePath)) {
        const cameraImageRel = path.relative(htmlDir, cameraImagePath);
        iconBeforeText = `<img src="${cameraImageRel}" alt="Camera" style="width: 24pt; height: 24pt; object-fit: contain; vertical-align: middle; margin-right: 8pt; display: inline-block;" />`;
      }
    }

    listHTML += `<li style="margin-left: ${indent}pt; margin-bottom: ${marginBottom}; font-size: ${fontSize}; color: ${TEXT_COLOR}; line-height: ${lineHeight}; word-wrap: break-word; overflow-wrap: break-word;">
      ${iconBeforeText}${formattedText}
    </li>`;
  });
  listHTML += '</ul>';

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
  margin: 30pt 120pt 20pt 40pt;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
.content {
  flex: 1;
  margin: 0 120pt 180pt 40pt;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
  padding-bottom: 40pt;
  max-height: calc(100% - 100pt);
}
</style>
</head>
<body>
<h1 class="title">${escapeHtml(slide.title || '')}</h1>
<div class="content">
  ${listHTML}
</div>
</body>
</html>`;
}

module.exports = { generateContentBulletsHTML };



