'use strict';

const path = require('path');

module.exports = {
  process(src, filename) {
    const assetFilename = JSON.stringify(path.basename(filename));

    if (filename.match(/\.svg$/)) {
      // Create a simple component that just renders the file basename
      const pascalCaseName = path.basename(filename, '.svg')
        .split(/[-_\s]+/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('');
      
      const componentName = `Svg${pascalCaseName}`;
      
      return `const React = require('react');
module.exports = {
  __esModule: true,
  default: ${assetFilename},
  ReactComponent: React.forwardRef(function ${componentName}(props, ref) {
    return {
      $$typeof: Symbol.for('react.element'),
      type: 'svg',
      ref: ref,
      key: null,
      props: Object.assign({}, props, {
        children: ${assetFilename}
      })
    };
  }),
};
`;
    }

    return `module.exports = ${assetFilename};`;
  },
  getCacheKey() {
    return 'fileTransform';
  },
};