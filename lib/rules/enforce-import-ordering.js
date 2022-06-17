const sortedUniqBy = require('lodash/sortedUniqBy');
const tail = require('lodash/tail');

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce ordering of import blocks by source and kind',
    },
    schema: []
  },

  create: context => {
    return {
      Program: program => {
        const topLevelUniqueNodes = sortedUniqBy(program.body, node => node.type);
        const fragmentedImportDecls = tail(topLevelUniqueNodes).filter(
          node => node.type === 'ImportDeclaration'
        );

        fragmentedImportDecls.forEach(badImportDecl => {
          context.report({
            node: badImportDecl,
            message: 'Import declarations must appear before any other statements'
          });
        });
      },
    };
  }
};
