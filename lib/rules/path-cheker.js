/* eslint-disable eslint-plugin/require-meta-type */
/* eslint-disable no-unused-vars */
/* eslint-disable eslint-plugin/prefer-message-ids */
"use strict";

const path = require ('path');

module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: "feature sliced relative path checker",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [], // Add a schema if the rule has options
  },

  create(context) {

    return {
      ImportDeclaration(node) {
        // example app/entities/event
        const importTo = node.source.value;

        // exapmle /Users/atimosenko/JS/work/si-tv-front/src/entities/event/ui/EventList/index.tsx
        const fromFilename = context.getFilename();

        if(shouldBeRelative(fromFilename, importTo)) {
          context.report({node: node, message: 'В рамках одного слайса все пути должны быть относительными'});
        }
      }
    };
  },
};

function isPathRelative(path) {
  return path === '.' || path.startsWith('./') || path.startsWith('../');
}

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

  const toArray = to.split('/');
  const toLayer = toArray[0]; // entities
  const toSlice = toArray[1]; // event

  if (!toLayer || !toSlice || !layers[toLayer]) {
    return false;
  }
  
  const normalizedPath = path.toNamespacedPath(from);
  const projectFrom = normalizedPath.split('src')[1];
  const fromArray = projectFrom.split('/');
  const fromLayer = fromArray[1];
  const fromSlice = fromArray[2];

  if (!fromLayer || !fromSlice || !layers[fromLayer]) {
    return false;
  }

  return fromSlice === toSlice && toLayer == fromLayer;
}
