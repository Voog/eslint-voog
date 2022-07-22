
const verifyVarDeclsOnTop = (block, {report}) => {
  let nonVarNodeSeen = false;

  block.body.forEach(node => {
    const isNodeVarDecl = node.type === 'VariableDeclaration';
    const isNodeLetConst = isNodeVarDecl && (node.kind === 'let' || node.kind === 'const');

    if (isNodeLetConst && nonVarNodeSeen) {
      report({
        node,
        message: 'let / const declarations must appear before any other statements in block scope'
      });
    }
    else if (!isNodeVarDecl) {
      nonVarNodeSeen = true;
    }
  });
};

module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require let and const declarations at the top of their containing scope'
    },
    schema: []
  },

  create: context => {
    return {
      BlockStatement: block => verifyVarDeclsOnTop(block, {report: context.report})
    };
  }
};
