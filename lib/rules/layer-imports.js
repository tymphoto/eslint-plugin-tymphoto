const path = require('path');
const { getCurrentFileLayer, isPathRelative } = require('../helpers');
const micromatch = require('micromatch');

module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: "Layer check",
      category: "FSD eslint-plugin",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [
      {
        type: 'object',
        properties: {
          alias: {
            type: 'string',
          },
          ignoreImportPatterns: {
            type: 'array',
          }
        },
      }
    ],
  },

  create(context) {
    const layers = {
      'app': ['pages', 'widgets', 'features', 'shared', 'entities', 'processes'],
      'processes': ['pages', 'widgets', 'features', 'shared', 'entities'],
      'pages': ['widgets', 'features', 'shared', 'entities'],
      'widgets': ['features', 'shared', 'entities'],
      'features': ['shared', 'entities'],
      'entities': ['shared', 'entities'],
      'shared': ['shared'],
    }

    const availableLayers = {
      'app': 'app',
      'processes': 'processes',
      'entities': 'entities',
      'features': 'features',
      'shared': 'shared',
      'pages': 'pages',
      'widgets': 'widgets',
    }


    const {alias = '', ignoreImportPatterns = []} = context.options[0] ?? {};

    const getImportLayer = (value) => {
      const importPath = alias ? value.replace(`${alias}/`, '') : value;
      const segments = importPath?.split('/')

      return segments?.[0]
    }

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value
        const fromFileName = context.getFilename();
        const currentFileLayer = getCurrentFileLayer(fromFileName)
        const importLayer = getImportLayer(importPath)

        if(isPathRelative(importPath)) {
          return;
        }

        if(!availableLayers[importLayer] || !availableLayers[currentFileLayer]) {
          return;
        }

        const isIgnored = ignoreImportPatterns.some(pattern => {
          return micromatch.isMatch(importPath, pattern)
        });

        if(isIgnored) {
          return;
        }

        if(!layers[currentFileLayer]?.includes(importLayer)) {
          context.report(node, `Current layer can import only layers below: (${layers[currentFileLayer]?.join(', ')}).`);
        }
      }
    };
  },
};
