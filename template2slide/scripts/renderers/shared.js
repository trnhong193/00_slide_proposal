const path = require('path');

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getBackgroundRelPath(htmlDir, assetsDir) {
  return path.relative(htmlDir, path.join(assetsDir, 'background.png'));
}

// repo structure:
// template2slide/scripts/renderers/*  -> __dirname = .../template2slide/scripts/renderers
// template2slide/ref                 -> .../template2slide/ref
function getRefDir() {
  return path.join(path.dirname(__dirname), '..', 'ref');
}

function cleanTimelineEvent(event) {
  if (!event) return '';
  return String(event).replace(/^\s*\|+\s*/, '').replace(/\s*\|+\s*$/, '').trim();
}

module.exports = {
  cleanTimelineEvent,
  escapeHtml,
  getBackgroundRelPath,
  getRefDir,
};



