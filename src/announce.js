function makeAnnouncement(message, options) {
  if (options.debug) {
    // console.log('Announcing:', message);
  }
}

function announceLocation(data, options) {
  let message;

  if ('cursorLine' in data) {
    const { cursorLine, cursorColumn } = data;

    message = `Cursor is at line ${cursorLine}, column ${cursorColumn}.`;
  } else {
    const {
      selectionStartLine,
      selectionStartColumn,
      selectionEndLine,
      selectionEndColumn,
      selectionLength
    } = data;

    message = `Selection starts at line ${selectionStartLine}, column ${selectionStartColumn}, and ends at line ${selectionEndLine}, column ${selectionEndColumn}. ${selectionLength} characters selected.`;
  }

  makeAnnouncement(message, options);
}

export default function announce(type, data, options) {
  switch (type) {
    case 'location':
      return announceLocation(data, options);
  }
}
