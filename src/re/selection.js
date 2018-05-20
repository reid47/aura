import { dispatchSelectionChange } from '../custom-events';

/**
 * Represents the position of the cursor and/or current selection
 * within a `Document`.
 */
export default class Selection {
  constructor(root, document) {
    this.root = root;
    this.document = document;

    this.cursorLine = 0;
    this.cursorCol = 0;
  }

  /**
   * Moves cursor one line up, preserving cursor column when possible.
   */
  moveCursorLineUp = () => {
    if (this.cursorLine > 0) {
      this.cursorLine--;
      this.notifySelectionChange();
    }
  };

  /**
   * Moves cursor one line down, preserving cursor column when possible.
   */
  moveCursorLineDown = () => {
    if (this.cursorLine < this.document.getLineCount() - 1) {
      this.cursorLine++;
      this.notifySelectionChange();
    }
  };

  /**
   * Moves cursor one column backward.
   */
  moveCursorColBackward = () => {
    if (this.cursorCol > 0) {
      this.cursorCol--;
      this.notifySelectionChange();
      return;
    }

    if (this.cursorLine > 0) {
      this.cursorCol = this.document.getLineLength(this.cursorLine - 1);
      this.cursorLine--;
      this.notifySelectionChange();
      return;
    }
  };

  /**
   * Moves cursor one column forward.
   */
  moveCursorColForward = () => {
    if (this.cursorCol < this.document.getLineLength(this.cursorLine)) {
      this.cursorCol++;
      this.notifySelectionChange();
      return;
    }

    if (this.cursorLine < this.document.getLineCount() - 1) {
      this.cursorLine++;
      this.cursorCol = 0;
      this.notifySelectionChange();
      return;
    }
  };

  /**
   * Moves cursor to the beginning of the current line.
   */
  moveCursorLineStart = () => {
    this.cursorCol = 0;
    this.notifySelectionChange();
  };

  /**
   * Moves cursor to the end of the current line.
   */
  moveCursorLineEnd = () => {
    this.cursorCol = this.document.getLineLength(this.cursorLine);
    this.notifySelectionChange();
  };

  /**
   * Moves cursor to the very beginning of the document.
   */
  moveCursorDocumentStart = () => {
    this.cursorLine = 0;
    this.cursorCol = 0;
    this.notifySelectionChange();
  };

  /**
   * Moves cursor to the very end of the document.
   */
  moveCursorDocumentEnd = () => {
    this.cursorLine = this.document.getLineCount() - 1;
    this.cursorCol = this.document.getLineLength(this.cursorLine);
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
}
