import { dispatchSelectionChange } from '../custom-events';

/**
 * Represents the position of the cursor and/or current selection
 * within a `Document`.
 */
export default class Selection {
  constructor(root, session, document) {
    this.root = root;
    this.session = session;
    this.document = document;

    this.cursorLine = 0;
    this.cursorCol = 0;
    this.savedCursorCol = 0;
  }

  /**
   * Gets the current cursor/selection info
   */
  getState = () => ({
    cursorLine: this.cursorLine,
    cursorCol: this.cursorCol,
    selectionActive: false
  });

  /**
   * Sets the current cursor column
   */
  setCursorCol = newCursorCol => {
    this.cursorCol = this.savedCursorCol = newCursorCol;
    this.notifySelectionChange();
  };

  /**
   * Moves cursor one line up, preserving cursor column when possible.
   */
  moveCursorLineUp = () => {
    if (this.cursorLine > 0) {
      this.cursorLine--;
      const lineLength = this.document.getLineLength(this.cursorLine);
      this.cursorCol = Math.min(this.savedCursorCol, lineLength);
    }

    this.notifySelectionChange();
  };

  /**
   * Moves cursor one line down, preserving cursor column when possible.
   */
  moveCursorLineDown = () => {
    if (this.cursorLine < this.document.getLineCount() - 1) {
      this.cursorLine++;
      const lineLength = this.document.getLineLength(this.cursorLine);
      this.cursorCol = Math.min(this.savedCursorCol, lineLength);
    }

    this.notifySelectionChange();
  };

  /**
   * Moves cursor one column backward.
   */
  moveCursorColBackward = () => {
    if (this.cursorCol > 0) {
      this.cursorCol = this.savedCursorCol = this.cursorCol - 1;
    } else if (this.cursorLine > 0) {
      this.cursorCol = this.savedCursorCol = this.document.getLineLength(
        this.cursorLine - 1
      );
      this.cursorLine--;
    }

    this.notifySelectionChange();
  };

  /**
   * Moves cursor one column forward.
   */
  moveCursorColForward = () => {
    if (this.cursorCol < this.document.getLineLength(this.cursorLine)) {
      this.cursorCol++;
      this.savedCursorCol = this.cursorCol;
    } else if (this.cursorLine < this.document.getLineCount() - 1) {
      this.cursorLine++;
      this.cursorCol = this.savedCursorCol = 0;
    }

    this.notifySelectionChange();
  };

  /**
   * Moves cursor to the beginning of the current line.
   */
  moveCursorLineStart = () => {
    this.cursorCol = this.savedCursorCol = 0;
    this.notifySelectionChange();
  };

  /**
   * Moves cursor to the end of the current line.
   */
  moveCursorLineEnd = () => {
    this.cursorCol = this.savedCursorCol = this.document.getLineLength(
      this.cursorLine
    );
    this.notifySelectionChange();
  };

  /**
   * Moves cursor to the very beginning of the document.
   */
  moveCursorDocumentStart = () => {
    this.cursorLine = 0;
    this.cursorCol = this.savedCursorCol = 0;
    this.notifySelectionChange();
  };

  /**
   * Moves cursor to the very end of the document.
   */
  moveCursorDocumentEnd = () => {
    this.cursorLine = this.document.getLineCount() - 1;
    this.cursorCol = this.savedCursorCol = this.document.getLineLength(
      this.cursorLine
    );
    this.notifySelectionChange();
  };

  /**
   * Raises a `selectionChange` event on the DOM node.
   */
  notifySelectionChange = () => {
    dispatchSelectionChange(this.root, {
      cursorLine: this.cursorLine,
      cursorCol: this.cursorCol
    });
  };

  /**
   * Handles mousedown events on the scroll container and updates the selection
   * accordingly.
   */
  onMouseDown = evt => {
    const characterWidth = this.session.getCharacterWidth();
    const lineHeight = this.session.getSetting('lineHeight');
    const rect = evt.currentTarget.getBoundingClientRect();
    const offsetX = evt.clientX + evt.currentTarget.scrollLeft - rect.left;
    const offsetY = evt.clientY + evt.currentTarget.scrollTop - rect.top;

    // TODO: binary search?
    let newCursorLine = 0;
    while (newCursorLine * lineHeight < offsetY) {
      newCursorLine++;
    }
    newCursorLine--;

    const newCursorCol = Math.min(
      this.document.getLineLength(newCursorLine),
      Math.round(offsetX / characterWidth)
    );

    this.cursorLine = newCursorLine;
    this.cursorCol = this.savedCursorCol = newCursorCol;
    this.notifySelectionChange();
  };
}
