const { escapeHtml, getBackgroundRelPath, cleanTimelineEvent } = require('./shared');

function generateTimelineHTML(slide, htmlDir, assetsDir, constants) {
  const bgPath = getBackgroundRelPath(htmlDir, assetsDir);
  const milestones = slide.timeline?.milestones || [];

  const { SLIDE_WIDTH, SLIDE_HEIGHT, ACCENT_COLOR, TEXT_COLOR } = constants;

  let timelineHTML = '';
  const timelineStartX = 80;
  const timelineEndX = SLIDE_WIDTH - 80;
  const timelineY = SLIDE_HEIGHT / 2 + 40;
  const spacing = milestones.length > 1 ? (timelineEndX - timelineStartX) / (milestones.length - 1) : 0;

  const textY = timelineY - 80;

  milestones.forEach((milestone, index) => {
    const x = timelineStartX + (index * spacing);
    const eventText = cleanTimelineEvent(milestone.event);
    const phase = milestone.phase || '';
    const date = milestone.date ? cleanTimelineEvent(milestone.date) : '';

    const maxWidth = Math.min(160, spacing - 10);

    timelineHTML += `
      <div style="position: absolute; left: ${x}pt; top: ${timelineY}pt;">
        <div style="width: 12pt; height: 12pt; background: ${ACCENT_COLOR}; border-radius: 50%; border: 2px solid ${TEXT_COLOR}; position: absolute; top: -6pt; left: -6pt;"></div>
        <div style="position: absolute; left: ${-maxWidth / 2}pt; top: ${textY - timelineY}pt; width: ${maxWidth}pt; text-align: center;">
          <p style="color: ${TEXT_COLOR}; font-size: 11pt; line-height: 1.3; margin: 0 0 4pt 0; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(eventText)}</p>
          <p style="color: ${ACCENT_COLOR}; font-size: 12pt; font-weight: bold; margin: 0 0 2pt 0;">${escapeHtml(phase)}</p>
          ${date ? `<p style="color: ${TEXT_COLOR}; font-size: 10pt; margin: 0; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(date)}</p>` : ''}
        </div>
      </div>
    `;
  });

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
  position: relative;
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
.timeline-container {
  flex: 1;
  position: relative;
  margin: 0 40pt 72pt 40pt;
  overflow: hidden;
  min-height: 0;
  padding-bottom: 0;
}
.timeline-line {
  position: absolute;
  left: ${timelineStartX}pt;
  width: ${timelineEndX - timelineStartX}pt;
  top: ${timelineY}pt;
  height: 2pt;
  background: ${ACCENT_COLOR};
}
</style>
</head>
<body>
<h1 class="title">${escapeHtml(slide.title || '')}</h1>
<div class="timeline-container">
  <div class="timeline-line"></div>
  ${timelineHTML}
</div>
</body>
</html>`;
}

module.exports = { generateTimelineHTML };



