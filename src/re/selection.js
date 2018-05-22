import { dispatchSelectionChange } from '../custom-events';

const whitespaceRe = /^\s/;
const wordSepRe = /^[.,!?$/_\\\-=+*'";:()[\]{}|`~<>@#%^&]/;
const wordSepOrWhitespaceRe = /^[.,!?$/_\\\-=+*'";:()[\]{}|`~<>@#%^&\s]/;

/**
 * Represents the position of the cursor and/or current selection
 * within a `Document`
 */
export default class Selection {
  constructor(root, session, document) {
    this.root = root;
    this.session = session;
    this.document = document;

    this.cursorLine = 0;
    this.cursorCol = 0;
    this.savedCursorCol = 0;
    this.selectionActive = false;
    this.selectionEndLine = 0;
    this.selectionEndCol = 0;
  }

  /**
   * Sets the current cursor line
   */
  setCursorLine = newCursorLine => {
    this.selectionActive = false;
    this.cursorLine = this.selectionEndLine = newCursorLine;
    this.notifySelectionChange();
  };

  /**
   * Sets the current cursor column
   */
  setCursorCol = newCursorCol => {
    this.selectionActive = false;
    this.cursorCol = this.selectionEndCol = this.savedCursorCol = newCursorCol;
    this.notifySelectionChange();
  };

  /**
   * Sets the current cursor line and column
   */
  setCursorPosition = (newCursorLine, newCursorCol) => {
    this.selectionActive = false;
    this.cursorLine = this.selectionEndLine = newCursorLine;
    this.cursorCol = this.selectionEndCol = this.savedCursorCol = newCursorCol;
    this.notifySelectionChange();
  };

  /**
   * Moves cursor one line down, preserving cursor column when possible.
   */
  moveCursorLineDown = () => {
    if (this.cursorLine < this.document.getLineCount() - 1) {
      this.selectionActive = false;
      this.cursorLine = this.selectionEndLine = this.cursorLine + 1;
      const lineLength = this.document.getLineLength(this.cursorLine);
      this.cursorCol = this.selectionEndCol = Math.min(this.savedCursorCol, lineLength);
    }

    this.notifySelectionChange();
  };

  /**
   * Moves cursor one line up, preserving cursor column when possible.
   */
  moveCursorLineUp = () => {
    if (this.cursorLine > 0) {
      this.selectionActive = false;
      this.cursorLine = this.selectionEndLine = this.cursorLine - 1;
      const lineLength = this.document.getLineLength(this.cursorLine);
      this.cursorCol = this.selectionEndCol = Math.min(this.savedCursorCol, lineLength);
    }

    this.notifySelectionChange();
  };

  /**
   * Moves cursor one column forward.
   */
  moveCursorColForward = () => {
    if (this.cursorCol < this.document.getLineLength(this.cursorLine)) {
      this.selectionActive = false;
      this.cursorCol = this.selectionEndCol = this.savedCursorCol = this.cursorCol + 1;
      this.savedCursorCol = this.cursorCol;
    } else if (this.cursorLine < this.document.getLineCount() - 1) {
      this.selectionActive = false;
      this.cursorLine = this.selectionEndLine = this.cursorLine + 1;
      this.cursorCol = this.selectionEndCol = this.savedCursorCol = 0;
    }

    this.notifySelectionChange();
  };

  /**
   * Moves cursor one column backward.
   */
  moveCursorColBackward = () => {
    if (this.cursorCol > 0) {
      this.selectionActive = false;
      this.cursorCol = this.selectionEndCol = this.savedCursorCol = this.cursorCol - 1;
    } else if (this.cursorLine > 0) {
      this.selectionActive = false;
      this.cursorCol = this.selectionEndCol = this.savedCursorCol = this.document.getLineLength(
        this.cursorLine - 1
      );
      this.cursorLine--;
    }

    this.notifySelectionChange();
  };

  /**
   * Moves cursor one word forward.
   */
  moveCursorWordForward = () => {
    const lineText = this.document.getLine(this.cursorLine);
    const length = lineText.length;
    if (this.cursorCol === length) return this.moveCursorColForward();

    let i = this.cursorCol;
    while (i < length && whitespaceRe.test(lineText[i])) i++;
    if (i < length) {
      if (wordSepRe.test(lineText[i])) {
        while (i < length && wordSepRe.test(lineText[i])) i++;
      } else {
        while (i < length && !wordSepOrWhitespaceRe.test(lineText[i])) i++;
      }
    }

    this.selectionActive = false;
    this.cursorCol = this.selectionEndCol = this.savedCursorCol = i;
    this.notifySelectionChange();
  };

  /**
   * Moves cursor one word backward.
   */
  moveCursorWordBackward = () => {
    if (this.cursorCol === 0) return this.moveCursorColBackward();
    const lineText = this.document.getLine(this.cursorLine);

    let i = this.cursorCol;
    while (i > 0 && whitespaceRe.test(lineText[i - 1])) i--;
    if (i > 0) {
      if (wordSepRe.test(lineText[i - 1])) {
        while (i > 0 && wordSepRe.test(lineText[i - 1])) i--;
      } else {
        while (i > 0 && !wordSepOrWhitespaceRe.test(lineText[i - 1])) i--;
      }
    }

    this.selectionActive = false;
    this.cursorCol = this.selectionEndCol = this.savedCursorCol = i;
    this.notifySelectionChange();
  };

  /**
   * Moves cursor to the beginning of the current line.
   */
  moveCursorLineStart = () => {
    this.selectionActive = false;
    this.cursorCol = this.selectionEndCol = this.savedCursorCol = 0;
    this.notifySelectionChange();
  };

  /**
   * Moves cursor to the end of the current line.
   */
  moveCursorLineEnd = () => {
    this.selectionActive = false;
    this.cursorCol = this.selectionEndCol = this.savedCursorCol = this.document.getLineLength(
      this.cursorLine
    );
    this.notifySelectionChange();
  };

  /**
   * Moves cursor to the very beginning of the document.
   */
  moveCursorDocumentStart = () => {
    this.selectionActive = false;
    this.cursorLine = this.selectionEndLine = 0;
    this.cursorCol = this.selectionEndCol = this.savedCursorCol = 0;
    this.notifySelectionChange();
  };

  /**
   * Moves cursor to the very end of the document.
   */
  moveCursorDocumentEnd = () => {
    this.selectionActive = false;
    this.cursorLine = this.selectionEndLine = this.document.getLineCount() - 1;
    this.cursorCol = this.selectionEndCol = this.savedCursorCol = this.document.getLineLength(
      this.cursorLine
    );
    this.notifySelectionChange();
  };

  /**
   * Handles mousedown events on the scroll container and updates the selection
   * accordingly.
   */
  onMouseDown = evt => {
    const characterWidth = this.session.getCharacterWidth();
    const lineCount = this.document.getLineCount();
    const lineHeight = this.session.getSetting('lineHeight');
    const rect = evt.currentTarget.getBoundingClientRect();
    const offsetX = evt.clientX + evt.currentTarget.scrollLeft - rect.left;
    const offsetY = evt.clientY + evt.currentTarget.scrollTop - rect.top;

    const newCursorLine = Math.min(~~(offsetY / lineHeight), lineCount - 1);
    const newCursorCol = Math.min(
      this.document.getLineLength(newCursorLine),
      Math.round(offsetX / characterWidth)
    );

    this.selectionActive = false;
    this.cursorLine = this.selectionEndLine = newCursorLine;
    this.cursorCol = this.selectionEndCol = this.savedCursorCol = newCursorCol;
    this.notifySelectionChange();
  };

  /**
   * Moves selection one column forward.
   */
  selectColForward = () => {
    if (this.selectionEndCol < this.document.getLineLength(this.cursorLine)) {
      this.selectionActive = true;
      this.selectionEndCol++;
    } else if (this.selectionEndLine < this.document.getLineCount() - 1) {
      this.selectionActive = true;
      this.selectionEndLine++;
      this.selectionEndCol = 0;
    }

    this.notifySelectionChange();
  };

  /**
   * Moves cursor one column backward.
   */
  selectColBackward = () => {
    if (this.selectionEndCol > 0) {
      this.selectionActive = true;
      this.selectionEndCol = this.selectionEndCol - 1;
    } else if (this.selectionEndLine > 0) {
      this.selectionActive = true;
      this.selectionEndCol = this.document.getLineLength(this.selectionEndLine - 1);
      this.selectionEndLine--;
    }

    this.notifySelectionChange();
  };

  /**
   * Moves selection one word forward.
   */
  selectWordForward = () => {
    const lineText = this.document.getLine(this.cursorLine);
    const length = lineText.length;
    if (this.selectionEndCol === length) return this.selectColForward();

    let i = this.selectionEndCol;
    while (i < length && whitespaceRe.test(lineText[i])) i++;
    if (i < length) {
      if (wordSepRe.test(lineText[i])) {
        while (i < length && wordSepRe.test(lineText[i])) i++;
      } else {
        while (i < length && !wordSepOrWhitespaceRe.test(lineText[i])) i++;
      }
    }

    this.selectionActive = true;
    this.selectionEndCol = i;
    this.notifySelectionChange();
  };

  /**
   * Moves selection one word backward.
   */
  selectWordBackward = () => {
    if (this.selectionEndCol === 0) return this.selectColBackward();
    const lineText = this.document.getLine(this.cursorLine);

    let i = this.selectionEndCol;
    while (i > 0 && whitespaceRe.test(lineText[i - 1])) i--;
    if (i > 0) {
      if (wordSepRe.test(lineText[i - 1])) {
        while (i > 0 && wordSepRe.test(lineText[i - 1])) i--;
      } else {
        while (i > 0 && !wordSepOrWhitespaceRe.test(lineText[i - 1])) i--;
      }
    }

    this.selectionActive = true;
    this.selectionEndCol = i;
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
