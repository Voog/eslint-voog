
const REACT_INDEX_MODULE_FN_REGEX = new RegExp('/[A-Z]\\w+/index\\.js$');

const verifyImportNode = (node, {report}) => {
  if (!node.source.value.startsWith('./')) {
    report({
      node,
      message: 'A React component index module must only import from within its directory'
    });
  }
};

const verifyExportNode = (node, {report}) => {
  if (node.declaration && node.declaration.type !== 'Identifier') {
    report({
      node,
      message:
        'A React component index module must only re-export previously imported identifiers'
    });
  }

  if (node.source && !node.source.value.startsWith('./')) {
    report({
      node,
      message:
        'A React component index module must only re-export from within its directory'
    });
  }
};

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require React index modules to only re-export'
    },
    schema: []
  },

  create: ({report, getFilename}) => {
    const isReactIndexModule = REACT_INDEX_MODULE_FN_REGEX.test(getFilename());

    if (!isReactIndexModule) {
      return {};
    }

    return {
      Program: program => {
        program.body.forEach(node => {
          if (node.type === 'ImportDeclaration') {
            verifyImportNode(node, {report});
          } else if (
            node.type === 'ExportDefaultDeclaration' ||
            node.type === 'ExportNamedDeclaration' ||
            node.type === 'ExportAllDeclaration'
          ) {
            verifyExportNode(node, {report});
          } else {
            report({
              node,
              message:
                'Only import or export declarations allowed in a React component index module'
            });
          }
        });
      },
    };
  }
};
