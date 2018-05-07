import getLocation from './get-location';
import { parse, visit } from './languages/js';

export default function getContext(textarea) {
  console.time('o');
  const text = textarea.value;
  const location = getLocation(textarea);
  if ('selectionStartLine' in location) return;

  const ast = parse(text);
  const { cursorLine, cursorColumn, cursorIndex } = location;
  const pathToCursor = [];

  visit(ast, node => {
    if (node.start > cursorIndex || node.end < cursorIndex) return;
    pathToCursor.push(node);
    return true;
  });

  console.timeEnd('o');

  return {};
}
