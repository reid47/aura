let textareaHasTextNodes;

function canInsertTextNodes(textarea) {
  if (typeof textareaHasTextNodes === 'undefined') {
    const testTextarea = document.createElement('textarea');
    testTextarea.value = 1;
    textareaHasTextNodes = !!testTextarea.firstChild;
  }

  return textareaHasTextNodes;
}

// thanks to:
// https://www.everythingfrontend.com/posts/insert-text-into-textarea-at-cursor-position.html
export const insertTextAtCursor = (textarea, text) => {
  textarea.focus();

  // This works for Chrome, Opera, Safari, and Edge
  if (document.execCommand('insertText', false, text)) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionStart;

  if (typeof textarea.setRangeText === 'function') {
    // If that fails, try it this way for Firefox
    textarea.setRangeText(text);
  } else if (canInsertTextNodes(textarea)) {
    // If that fails, try this for IE 11
    const textNode = document.createTextNode(text);
    let node = textarea.firstChild;
    if (!node) {
      textarea.appendChild(textNode);
    } else {
      let offset = 0;
      let startNode = null;
      let endNode = null;

      const range = document.createRange();
      while (node && (startNode === null || endNode === null)) {
        const nodeLength = node.nodeValue.length;

        if (start >= offset && start <= offset + nodeLength) {
          range.setStart((startNode = node), start - offset);
        }

        if (end >= offset && end <= offset + nodeLength) {
          range.setEnd((endNode = node), end - offset);
        }

        offset += nodeLength;
        node = node.nextSibling;
      }

      if (start !== end) {
        range.deleteContents();
      }

      range.insertNode(textNode);
    }
  } else if (document.selection) {
    // If that fails, try this approach for IE 8-10
    const ieRange = document.selection.createRange();
    ieRange.text = text;
    ieRange.collapse(false);
    ieRange.select();
  } else {
    // If all else fails, resort to naive way of doing it
    const value = textarea.value;
    textarea.value = value.slice(0, start) + text + value.slice(end);
  }

  textarea.setSelectionRange(start + text.length, start + text.length);

  const evt = document.createEvent('UIEvent');
  evt.initEvent('input', true, false);
  textarea.dispatchEvent(evt);
};

export const deleteTextAtCursor = (textarea, numCharsToDelete) => {
  // TODO: does this work across browsers?
  textarea.focus();
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  textarea.selectionStart = start - numCharsToDelete;
  document.execCommand('delete', false, null);
};

export const getIndentAtIndex = (textarea, index) => {
  const value = textarea.value;
  let i = index - 1;
  let level = 0;
  let indent = '';
  let lastNonSpaceChar;

  // Move backwards from current index until we find a newline
  // or reach the beginning of the text
  while (i > 0 && value[i] !== '\n') {
    if (typeof lastNonSpaceChar === 'undefined' && value[i] !== ' ') {
      lastNonSpaceChar = value[i];
    }

    i--;
  }

  // Advance one character to move past the newline we just found
  i++;

  // While the character at i is a space, increment level
  while (i < index && value[i++] === ' ') {
    level++;
    indent += ' ';
  }

  return { level, indent, lastNonSpaceChar };
};

export const getCursorPositionFromIndex = (lineStartIndexes, index) => {
  let i = 0;
  // TODO: binary search here
  while (lineStartIndexes[i] <= index) i++;
  return {
    cursorLine: i - 1,
    cursorColumn: index - (lineStartIndexes[i - 1] || 0)
  };
};
