export default function getLocation(textarea) {
  const text = textarea.value;
  const selectionStartIndex = textarea.selectionStart;
  const selectionEndIndex = textarea.selectionEnd;
  const hasSelection = selectionStartIndex !== selectionEndIndex;

  let line = 1;
  let column = 1;
  let index = 0;
  let selectionStartLine;
  let selectionStartColumn;

  while (index < selectionEndIndex) {
    if (hasSelection && index === selectionStartIndex) {
      selectionStartLine = line;
      selectionStartColumn = column;
    }

    if (text[index] === '\n') {
      line++;
      column = 1;
    } else {
      column++;
    }

    index++;
  }

  if (!hasSelection)
    return {
      cursorLine: line,
      cursorColumn: column,
      cursorIndex: selectionEndIndex
    };

  return {
    selectionStartLine,
    selectionStartColumn,
    selectionEndLine: line,
    selectionEndColumn: column,
    selectionLength: selectionEndIndex - selectionStartIndex
  };
}
