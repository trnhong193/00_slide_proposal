const { escapeHtml, getBackgroundRelPath, cleanTimelineEvent } = require('./shared');

function generateTimelineHTML(slide, htmlDir, assetsDir, constants) {
  const bgPath = getBackgroundRelPath(htmlDir, assetsDir);
  const milestones = slide.timeline?.milestones || [];

  const { SLIDE_WIDTH, SLIDE_HEIGHT, ACCENT_COLOR, TEXT_COLOR } = constants;

  let timelineHTML = '';
  // Center the timeline horizontally and vertically on the slide
  // Calculate optimal spacing and centering
  const horizontalMargin = 100; // Equal margins on both sides
  const timelineStartX = horizontalMargin;
  const timelineEndX = SLIDE_WIDTH - horizontalMargin;
  const timelineWidth = timelineEndX - timelineStartX;
  
  // Center timeline vertically (accounting for title at top)
  const titleHeight = 80; // Approximate title height
  const availableHeight = SLIDE_HEIGHT - titleHeight - 72; // 72pt bottom margin
  const timelineY = titleHeight + (availableHeight / 2) + 20; // Center in available space
  
  // Calculate spacing between milestones
  const spacing = milestones.length > 1 ? timelineWidth / (milestones.length - 1) : 0;

  // Position text above timeline
  const textY = timelineY - 90;

  milestones.forEach((milestone, index) => {
    // Calculate x position - center each milestone on the timeline
    const x = timelineStartX + (index * spacing);
    // phase contains the phase name (e.g., "Software Deployment")
    const phaseName = milestone.phase || milestone.event || '';
    // date contains the duration (e.g., "T1 + 4-6 weeks")
    const duration = milestone.date ? cleanTimelineEvent(milestone.date) : '';

    // Calculate max width for text - ensure it fits between milestones
    const maxWidth = Math.min(200, spacing - 20);

    // Show phase name on top, duration below - centered on milestone point
    timelineHTML += `
      <div style="position: absolute; left: ${x}pt; top: ${timelineY}pt; transform: translateX(-50%);">
        <div style="width: 12pt; height: 12pt; background: ${ACCENT_COLOR}; border-radius: 50%; border: 2px solid ${TEXT_COLOR}; position: absolute; top: -6pt; left: -6pt;"></div>
        <div style="position: absolute; left: ${-maxWidth / 2}pt; top: ${textY - timelineY}pt; width: ${maxWidth}pt; text-align: center;">
          <p style="color: ${ACCENT_COLOR}; font-size: 13pt; font-weight: bold; margin: 0 0 4pt 0; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(phaseName)}</p>
          ${duration ? `<p style="color: ${TEXT_COLOR}; font-size: 11pt; margin: 0; word-wrap: break-word; overflow-wrap: break-word;">${escapeHtml(duration)}</p>` : ''}
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
  width: ${timelineWidth}pt;
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



