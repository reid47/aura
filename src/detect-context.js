import detectLocation from './detect-location';
import { parse, visit } from './js-parser';

export default function detectContext(textarea) {
  const text = textarea.value;
  const location = detectLocation(textarea);
  if ('selectionStartLine' in location) return;

  const ast = parse(text);
  const { cursorLine, cursorColumn, cursorIndex } = location;
  const pathToCursor = [];

  visit(ast, node => {
    if (node.start > cursorIndex || node.end < cursorIndex) return;
    pathToCursor.push(node);
    return true;
  });

  console.log(pathToCursor);

  return {};
}
