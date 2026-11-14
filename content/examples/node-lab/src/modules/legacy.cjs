// CommonJS: module.exports und require. Läuft ohne "type": "module" nur mit der Endung .cjs.
const path = require('node:path');

module.exports = {
  describe(file) {
    return `${path.basename(file)} (CommonJS, __filename vorhanden: ${typeof __filename === 'string'})`;
  },
};
