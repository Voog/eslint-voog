// A rule to enforce two conditions:
//
// - Import declarations must appear before any other statements in a
//   source file.
// - Import declarations must appear sorted into the following blocks:
//   - Foreign imports (generally from node_modules)
//   - Local imports
//   - Stylesheet imports (CSS)
//   - Image imports (SVG, PNG, JPG)

const sortedUniqBy = require('lodash/sortedUniqBy');
const tail = require('lodash/tail');
const upperFirst = require('lodash/upperFirst');

const IMPORT_TYPES = {
  FOREIGN: 'foreign',
  LOCAL: 'local',
  CSS: 'stylesheet',
  IMAGE: 'image'
};

const DEFAULT_IMPORT_TYPE = IMPORT_TYPES.FOREIGN;

const IMPORT_REGEXES = {

  // TODO: make configurable

  [IMPORT_TYPES.CSS]: /\.css(\?\w+)?$/,
  [IMPORT_TYPES.IMAGE]: /\.(svg|png|jpe?g)(\?\w+)?$/,
  [IMPORT_TYPES.LOCAL]: /^(\.\.?\/|~\w|shared\/)/
};

const classifyImportDecl = node => {
  const value = node.source.value;

  for (const type of Object.values(IMPORT_TYPES)) {
    const regex = IMPORT_REGEXES[type];

    if (!regex) {
      continue;
    } else if (regex.test(value)) {
      return type;
    }
  }

  return DEFAULT_IMPORT_TYPE;
};

const verifyImportDeclsOnTop = (program, report) => {
  const topLevelUniqueNodes = sortedUniqBy(program.body, node => node.type);
  const fragmentedImportDecls = tail(topLevelUniqueNodes).filter(
    node => node.type === 'ImportDeclaration'
  );

  fragmentedImportDecls.forEach(badImportDecl => {
    report({
      node: badImportDecl,
      message: 'Import declarations must appear before any other statements'
    });
  });
};

const verifyImportDeclOrdering = (importDecls, report) => {
  const importTypeNames = Object.values(IMPORT_TYPES);
  const blockTypeIdxs = importTypeNames.reduce((acc, cur, i) => ({...acc, [cur]: i}), {});
  let maxBlockIdx = 0;

  importDecls.forEach(decl => {
    const declBlockIdx = blockTypeIdxs[decl.type];

    if (declBlockIdx > maxBlockIdx) {
      maxBlockIdx = declBlockIdx;
    } else if (declBlockIdx < maxBlockIdx) {
      report({
        node: decl.node,
        message: `${upperFirst(decl.type)} imports must not appear after ${
          importTypeNames[maxBlockIdx]
        } imports`
      });
    }
  });
};

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce ordering of import blocks by source and kind'
    },
    schema: []
  },

  create: context => {
    const importDecls = [];

    return {
      Program: program => {
        verifyImportDeclsOnTop(program, context.report);
      },

      ImportDeclaration: node => {
        importDecls.push({node, type: classifyImportDecl(node)});
      },

      'Program:exit': () => {
        verifyImportDeclOrdering(importDecls, context.report);
      }
    };
  }
};
