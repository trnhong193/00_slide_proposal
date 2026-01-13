const path = require('path');
const { escapeHtml, getBackgroundRelPath } = require('./shared');

function generateModuleDescriptionHTML(slide, mediaPath, mediaType, htmlDir, assetsDir, constants, videoUrl = null) {
  const bgPath = getBackgroundRelPath(htmlDir, assetsDir);
  const content = slide.content || {};

  const { SLIDE_WIDTH, SLIDE_HEIGHT, ACCENT_COLOR, TEXT_COLOR } = constants;

  const mediaRelPath = mediaPath ? path.relative(htmlDir, mediaPath) : null;
  const isVideo = mediaType === 'video' || mediaType === 'video_manual_insert';

  // showVideoLink only if video download failed (no mediaRelPath) but videoUrl exists
  const showVideoLink = (!mediaRelPath && videoUrl && String(videoUrl).trim() !== '');

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
  font-size: 26pt;
  font-weight: bold;
  text-transform: uppercase;
  margin: 20pt 40pt 12pt 40pt;
  word-wrap: break-word;
  overflow-wrap: break-word;
  flex-shrink: 0;
}
.content-wrapper {
  flex: 1;
  display: flex;
  margin: 0 40pt 72pt 40pt;
  gap: 25pt;
  min-height: 0;
  overflow: hidden;
  padding-bottom: 0;
}
.text-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  overflow-y: auto;
  overflow-x: hidden;
}
.media-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 0;
  overflow: hidden;
}
img, video {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}
video {
  background: #000000;
}
.video-link {
  color: ${ACCENT_COLOR};
  font-size: 10pt;
  word-wrap: break-word;
  overflow-wrap: break-word;
  text-align: center;
  margin-top: 10pt;
  padding: 5pt;
  border: 1px dashed ${ACCENT_COLOR};
}
.section {
  margin-bottom: 8pt;
}
.section-label {
  color: ${ACCENT_COLOR};
  font-size: 13pt;
  font-weight: bold;
  margin-bottom: 2pt;
  word-wrap: break-word;
  overflow-wrap: break-word;
}
.section-text {
  color: ${TEXT_COLOR};
  font-size: 11pt;
  line-height: 1.25;
  word-wrap: break-word;
  overflow-wrap: break-word;
  margin: 0;
}
</style>
</head>
<body>
<h1 class="title">${escapeHtml(slide.title || '')}</h1>
<div class="content-wrapper">
  <div class="text-content">
    ${content.purpose ? `<div class="section">
      <p class="section-label">Purpose:</p>
      <p class="section-text">${escapeHtml(content.purpose)}</p>
    </div>` : ''}
    ${content.alert_logic ? `<div class="section">
      <p class="section-label">Alert Logic:</p>
      <p class="section-text">${escapeHtml(content.alert_logic)}</p>
    </div>` : ''}
    ${content.preconditions ? `<div class="section">
      <p class="section-label">Preconditions:</p>
      <p class="section-text">${escapeHtml(content.preconditions)}</p>
    </div>` : ''}
    ${content.data_requirements ? `<div class="section">
      <p class="section-label">Data Requirements:</p>
      <p class="section-text">${escapeHtml(content.data_requirements)}</p>
    </div>` : ''}
  </div>
  <div class="media-content">
    ${mediaRelPath ? (isVideo
      ? `<video src="${mediaRelPath}" controls data-media-path="${mediaRelPath}" data-media-type="video" style="max-width: 100%; max-height: 100%;"></video>`
      : `<img src="${mediaRelPath}" alt="${escapeHtml(slide.title)}" data-media-path="${mediaRelPath}" data-media-type="image" />`
    ) : showVideoLink ? (
      `<div class="video-link"><p>Video URL (manual insert):</p><p>${escapeHtml(videoUrl)}</p></div>`
    ) : ''}
  </div>
</div>
</body>
</html>`;
}

module.exports = { generateModuleDescriptionHTML };



