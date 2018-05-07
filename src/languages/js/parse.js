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
  ]
};

export default function parse(code) {
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
