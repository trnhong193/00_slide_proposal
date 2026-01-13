const { generateTitleSlideHTML } = require('./title');
const { generateContentBulletsHTML } = require('./content_bullets');
const { generateTwoColumnHTML } = require('./two_column');
const { generateContentTableHTML } = require('./content_table');
const { generateModuleDescriptionHTML } = require('./module_description');
const { generateDiagramHTML } = require('./diagram');
const { generateTimelineHTML } = require('./timeline');

module.exports = {
  generateTitleSlideHTML,
  generateContentBulletsHTML,
  generateTwoColumnHTML,
  generateContentTableHTML,
  generateModuleDescriptionHTML,
  generateDiagramHTML,
  generateTimelineHTML,
};



