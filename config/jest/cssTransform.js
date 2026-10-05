'use strict';

module.exports = {
  process() {
    return { code: 'module.exports = {};' };
  },
  getCacheKey() {
    return 'cssTransform';
  },
};
