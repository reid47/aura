import babylon from 'babylon';

const babylonOptions = {
  sourceType: 'module',
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  plugins: [
    'jsx',
    'flow',
    'doExpressions',
    'objectRestSpread',
    'decorators',
    'classProperties',
    'exportDefaultFrom',
    'exportNamespaceFrom',
    'asyncGenerators',
    'functionBind',
    'functionSent',
    'dynamicImport',
    'numericSeparator'
    // 'importMeta',
    // 'optionalCatchBinding',
    // 'optionalChaining'
    // 'classPrivateProperties',
    // 'pipelineOperator',
    // 'nullishCoalescingOperator'
  ]
};

export function parse(code) {
  let ast;

  try {
    ast = babylon.parse(code, babylonOptions);
  } catch (err) {
    console.log({ err });
    throw err;
  }

  delete ast.tokens;
  return ast;
}

export function visit(node, visitFunc) {
  if (!node) return;

  if (Array.isArray(node)) {
    node.forEach(n => visit(n, visitFunc));
    return;
  }

  const shouldVisitParts = visitFunc(node);
  if (!shouldVisitParts) return;

  const visitParts = (...parts) =>
    parts.forEach(part => visit(node[part], visitFunc));

  switch (node.type) {
    case 'ArrayExpression':
      return visitParts('elements');

    case 'ArrayPattern':
      return visitParts('elements', 'typeAnnotation');

    case 'ArrowFunctionExpression':
      return visitParts('params', 'body', 'returnType', 'typeParameters');

    case 'AssignmentExpression':
    case 'AssignmentPattern':
    case 'BinaryExpression':
      return visitParts('left', 'right');

    case 'BlockStatement':
      return visitParts('directives', 'body');

    case 'BreakStatement':
      return visitParts('label');

    case 'CallExpression':
      return visitParts('callee', 'arguments', 'typeParameters');

    case 'CatchClause':
      return visitParts('param', 'body');

    case 'ClassBody':
      return visitParts('body');

    case 'ClassDeclaration':
    case 'ClassExpression':
      return visitParts(
        'id',
        'body',
        'superClass',
        'mixins',
        'typeParameters',
        'superTypeParameters',
        'implements',
        'decorators'
      );

    case 'ClassMethod':
      return visitParts(
        'key',
        'params',
        'body',
        'decorators',
        'returnType',
        'typeParameters'
      );

    case 'ConditionalExpression':
      return visitParts('test', 'consequent', 'alternate');

    case 'ContinueStatement':
      return visitParts('label');

    case 'Directive':
    case 'DirectiveLiteral':
      return visitParts('value');

    case 'DoWhileStatement':
      return visitParts('test', 'body');

    case 'ExportAllDeclaration':
      return visitParts('source');

    case 'ExportDefaultDeclaration':
      return visitParts('declaration');

    case 'ExportNamedDeclaration':
      return visitParts('declaration', 'specifiers', 'source');

    case 'ExportSpecifier':
      return visitParts('local', 'exported');

    case 'ExpressionStatement':
      return visitParts('expression');

    case 'File':
      return visitParts('program', 'comments');

    case 'ForStatement':
      return visitParts('init', 'test', 'update', 'body');

    case 'ForInStatement':
    case 'ForOfStatement':
      return visitParts('left', 'right', 'body');

    case 'FunctionDeclaration':
    case 'FunctionExpression':
      return visitParts('id', 'params', 'body', 'returnType', 'typeParameters');

    case 'IfStatement':
      return visitParts('test', 'consequent', 'alternate');

    case 'ImportDeclaration':
      return visitParts('specifiers', 'source');

    case 'ImportDefaultSpecifier':
    case 'ImportNamespaceSpecifier':
      return visitParts('local');

    case 'ImportSpecifier':
      return visitParts('local', 'imported');

    case 'LabeledStatement':
      return visitParts('label', 'body');

    case 'LogicalExpression':
      return visitParts('left', 'right');

    case 'MemberExpression':
      return visitParts('object', 'property');

    case 'MetaProperty':
      return visitParts('meta', 'property');

    case 'NewExpression':
      return visitParts('callee', 'arguments', 'typeParameters');

    case 'ObjectExpression':
      return visitParts('properties');

    case 'ObjectMethod':
      return visitParts(
        'key',
        'params',
        'body',
        'decorators',
        'returnType',
        'typeParameters'
      );

    case 'ObjectPattern':
      return visitParts('properties', 'typeAnnotation');

    case 'ObjectProperty':
      return visitParts('key', 'value', 'decorators');

    case 'Program':
      return visitParts('body');

    case 'RestElement':
      return visitParts('argument', 'typeAnnotation');

    case 'ReturnStatement':
      return visitParts('argument');

    case 'SequenceExpression':
      return visitParts('expressions');

    case 'SpreadElement':
      return visitParts('argument');

    case 'SwitchCase':
      return visitParts('test', 'consequent');

    case 'SwitchStatement':
      return visitParts('discriminant', 'cases');

    case 'TaggedTemplateExpression':
      return visitParts('tag', 'quasi');

    case 'TemplateElement':
      return visitParts('value', 'tail');

    case 'TemplateLiteral':
      return visitParts('quasis', 'expressions');

    case 'ThrowStatement':
      return visitParts('argument');

    case 'TryStatement':
      return visitParts('block', 'handler', 'finalizer');

    case 'UnaryExpression':
      return visitParts('argument');

    case 'UpdateExpression':
      return visitParts('argument');

    case 'VariableDeclaration':
      return visitParts('declarations');

    case 'VariableDeclarator':
      return visitParts('id', 'init');

    case 'WhileStatement':
      return visitParts('test', 'body');

    case 'WithStatement':
      return visitParts('object', 'body');

    case 'YieldExpression':
      return visitParts('argument');

    case 'BooleanLiteral':
    case 'DebuggerStatement':
    case 'EmptyStatement':
    case 'Identifier':
    case 'NullLiteral':
    case 'NumericLiteral':
    case 'RegExpLiteral':
    case 'StringLiteral':
    case 'Super':
    case 'ThisExpression':
      // Leaf nodes
      return;
  }
}
