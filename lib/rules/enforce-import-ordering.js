// A rule to enforce two conditions:
//
// - Import declarations must appear before any other statements in a
//   source file.
// - Import declarations must appear sorted into the following blocks:
//   - Foreign imports (generally from node_modules)
//   - Local imports
//   - Component-local imports
//   - Redux action imports
//   - Utility imports
//   - Constant imports
//   - Stylesheet imports (CSS)
//   - Image imports (SVG, PNG, JPG)

const sortedUniqBy = require('lodash/sortedUniqBy');
const tail = require('lodash/tail');
const upperFirst = require('lodash/upperFirst');

// The order of IMPORT_TYPES is significant and determines the enforced
// order of import statements.

const IMPORT_TYPES = {
  FOREIGN:            'foreign',
  LOCAL:              'local',
  COMPONENT_LOCAL:    'component-local',
  ACTION:             'action',
  UTIL:               'util',
  CONSTANT:           'constant',
  IMAGE:              'image',
  CSS:                'stylesheet',
};

// The order of IMPORT_REGEXES is significant: these are matched in order
// and the import declaration is deemed to represent the first matching
// type. Values may be either regexes matched against the source value
// (import path) or predicates receiving the import declaration node.

const IMPORT_REGEXES = {

  // TODO: make configurable

  [IMPORT_TYPES.ACTION]:          /(^|\/)actions(\/|\.js|$)/,
  [IMPORT_TYPES.UTIL]:            /(^|\/)utils(\/|\.js|$)/,
  [IMPORT_TYPES.CONSTANT]:        node => testConstantImport(node),
  [IMPORT_TYPES.IMAGE]:           /\.(svg|png|jpe?g)(\?\w+)?$/,
  [IMPORT_TYPES.CSS]:             /\.css(\?\w+)?$/,
  [IMPORT_TYPES.COMPONENT_LOCAL]: /^\.\//,
  [IMPORT_TYPES.LOCAL]:           /^(\.\.|~[\w~]+|shared|ecommerce)/,
  [IMPORT_TYPES.FOREIGN]:         /^@?(lodash\/)[\w-]+$/,
};

// Any import declarations to ignore (regexes are matched against
// source values).

const IGNORE_REGEXES = [
  /utils\/[A-Z]/,
  /^\.\/[a-z]/,
];

const CONSTANT_REGEX = /^[A-Z][A-Z_]+$/;

const testConstantImport = node =>
  node.specifiers.some(s => CONSTANT_REGEX.test((s.imported || s.local).name));

const classifyImportDecl = node => {
  const value = node.source.value;

  for (const regex of IGNORE_REGEXES) {
    if (regex.test(value)) {
      return null;
    }
  }

  for (const [type, regexOrFunc] of Object.entries(IMPORT_REGEXES)) {
    if ((typeof regexOrFunc === 'function') ? regexOrFunc(node) : regexOrFunc.test(value)) {
      return type;
    }
  }

  return null;
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

  for (const decl of importDecls) {
    const declType = decl.type;
    let declBlockIdx;

    if (declType === null) {
      continue;
    }

    declBlockIdx = blockTypeIdxs[declType];

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
  }
};

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce ordering of import blocks by source and kind'
    },
    schema: [
      {
        type: 'object',
        properties: {
          blockOrder: {type: 'array', items: {type: 'string'}},
          blockMembershipTests: {
            type: 'object',
            additionalProperties: {
              type: 'string'
            }
          },
          ignore: {type: 'array', items: {type: 'string'}},
          importsOnTop: {type: 'boolean'}
        },
        required: ['blockOrder', 'blockMembershipTests'],
        additionalProperties: false
      }
    ]
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
