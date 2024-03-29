// A rule to enforce the following conditions:
//
// - Import declarations must appear sorted into blocks defined by
//   `blockOrder` and `blockMembershipTests`.
// - Import declaration blocks must be separated by at least two newlines
//   (unless `checkBlockSeparation` is explicitly set to false).
// - Import declarations must appear before any other statements in a
//   source file (unless `checkImportsOnTop` is explicitly set to false).

const debug = require('debug')('eslint-plugin-voog:enforce-import-ordering');
const sortedUniqBy = require('lodash/sortedUniqBy');
const tail = require('lodash/tail');
const upperFirst = require('lodash/upperFirst');

const CONSTANT_REGEX = /^[A-Z][A-Z_]+$/;

const NAMED_TESTS = {
  constant: node =>
    !!node.specifiers.length &&
    node.specifiers.every(s => CONSTANT_REGEX.test((s.imported || s.local).name))
};

const compileOptions = context => {
  const optionsObj = context.options[0];

  const compiledOptions = {
    ignoreRegexes: (optionsObj.ignore || []).map(v => new RegExp(v)),
    importOrder: optionsObj.blockOrder,
    checkImportsOnTop: optionsObj.checkImportsOnTop !== false,
    checkBlockSeparation: optionsObj.checkBlockSeparation !== false,
    importTests: Object.entries(optionsObj.blockMembershipTests).reduce((acc, [k, v]) => (
      {...acc, [k]: typeof v === 'string' ? new RegExp(v) : v.namedTest}
    ), {})
  };

  for (const importKind of compiledOptions.importOrder) {
    if (!Object.hasOwn(compiledOptions.importTests, importKind)) {
      throw new Error(
        `"${importKind}" is stipulated in \`blockOrder\`, ` +
        `but not present in \`blockMembershipTests\``
      );
    }
  }

  return compiledOptions;
};

const classifyImportDecl = (node, {options}) => {
  const value = node.source.value;

  for (const regex of options.ignoreRegexes) {
    if (regex.test(value)) {
      return null;
    }
  }

  for (const [type, regexOrName] of Object.entries(options.importTests)) {
    if (
      typeof regexOrName === 'string' ? NAMED_TESTS[regexOrName](node) : regexOrName.test(value)
    ) {
      return type;
    }
  }

  return null;
};

const verifyImportDeclsOnTop = (program, {report}) => {
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

const verifyImportDeclOrdering = (importDecls, {options, report}) => {
  const importOrder = options.importOrder;
  const blockTypeIdxs = importOrder.reduce((acc, cur, i) => ({...acc, [cur]: i}), {});
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
          importOrder[maxBlockIdx]
        } imports`
      });
    }
  }
};

const verifyImportBlockSeparation = (importDecls, {getSourceCode, report}) => {
  let lastType;
  let source = getSourceCode().getText();
  const endsWithBlankLines = /\S\s*\n\s*\n\s*$/;

  for (const decl of importDecls) {
    const type = decl.type;
    const freshBlock = type && lastType && lastType !== type;

    if (freshBlock) {
      const sourceUpToDecl = source.slice(0, decl.start);

      if (!endsWithBlankLines.test(sourceUpToDecl)) {
        report({
          node: decl.node,
          message:
            `${upperFirst(decl.type)} and ${lastType} blocks must be separated by ` +
            'whitespace containing at least two newlines'
        });
      }
    }

    if (type == null) {

      // Replace ignored import statements in the examined source code with runs
      // of common space (0x20) so that these would also be ignored for block
      // separation checks.

      const declLength = decl.end - decl.start + 1;
      source = source.slice(0, decl.start) + ' '.repeat(declLength) + source.slice(decl.end + 1);
    }
    else {
      lastType = type;
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
              oneOf: [
                {type: 'string'},
                {
                  type: 'object',
                  properties: {namedTest: {enum: Object.keys(NAMED_TESTS)}},
                  required: ['namedTest'],
                  additionalProperties: false
                }
              ]
            }
          },
          ignore: {type: 'array', items: {type: 'string'}},
          checkBlockSeparation: {type: 'boolean'},
          checkImportsOnTop: {type: 'boolean'}
        },
        required: ['blockOrder', 'blockMembershipTests'],
        additionalProperties: false
      }
    ]
  },

  create: context => {
    const importDecls = [];
    const options = compileOptions(context);

    const passedContext = {
      report: context.report,
      getSourceCode: context.getSourceCode,
      options
    }

    return {
      Program: program => {
        if (options.checkImportsOnTop) {
          verifyImportDeclsOnTop(program, passedContext);
        }
      },

      ImportDeclaration: node => {
        const type = classifyImportDecl(node, passedContext);

        importDecls.push({
          node,
          type,
          start: node.range[0],
          end: node.range[1],
        });

        debug(`Saw '${node.source.value}', classified as "\x1B[30;1m${type}\x1B[m"`);
      },

      'Program:exit': () => {
        verifyImportDeclOrdering(importDecls, passedContext);

        if (options.checkBlockSeparation) {
          verifyImportBlockSeparation(importDecls, passedContext);
        }
      }
    };
  }
};
