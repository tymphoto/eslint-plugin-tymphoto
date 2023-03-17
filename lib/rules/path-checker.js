"use strict";

const path = require('path');
const { isPathRelative, normalizePath} = require('../helpers');

module.exports = {
  meta: {
    type: null,
    docs: {
      description: "feature sliced relative path checker",
      category: "FSD eslint-plugin",
      recommended: false,
      url: null,
    },
    fixable: null,
    schema: [
      {
        type: 'object',
        properties: {
          alias: {
            type: 'string'
          }
        }
      }
    ],
  },

  create(context) {
    const alias = context.options[0]?.alias || '';

    return {
      ImportDeclaration(node) {
        // example app/entities/event
        const value = node.source.value
        const importFrom  = alias ? value.replace(`${alias}/`, '') : value;

        // example /Users/atimosenko/JS/work/si-tv-front/src/entities/event/ui/EventDetails/index.tsx
        const fromFileName = context.getFilename();

         if (shouldBeRelative(fromFileName, importFrom)) {
            context.report({
              node, message: 'Within one slice all paths should be related.',
              fix: (fixer) => {
                const projectFrom = normalizePath(fromFileName, path); // /entities/Article/index.ts
                const newPath = projectFrom
                  .split('/')
                  .slice(0, -1)
                  .join('/'); // '/entities/Article'

                let relativePath = path.relative(newPath, `/${importFrom}`)
                  .replace(/\\/g, '/');

                if (!relativePath.startsWith('.')) {
                  relativePath = './' + relativePath;
                }

                return fixer.replaceText(node.source, `'${relativePath}'`);
            },
          });
        }
      }
    };
  },
};

const layers = {
  'entities': 'entities',
  'features': 'features',
  'shared': 'shared',
  'pages': 'pages',
  'widgets': 'widgets',
  'processes': 'processes',
}

function shouldBeRelative(from, to) {
  if(isPathRelative(to)) {
    return false;
  }

  // example entities/event
  const toArray = to.split('/')
  const toLayer = toArray[0]; // entities
  const toSlice = toArray[1]; // event

  if(!toLayer || !toSlice || !layers[toLayer]) {
    return false;
  }

  // example: c:\Users\user\project\src\entities\Article
  const projectFrom = normalizePath(from, path);

  const fromArray = projectFrom.split('/')
  const fromLayer = fromArray[1];
  const fromSlice = fromArray[2];

  if(!fromLayer || !fromSlice || !layers[fromLayer]) {
    return false;
  }

  return fromSlice === toSlice && toLayer === fromLayer;
}


