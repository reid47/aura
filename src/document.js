import { dispatchTextChange, dispatchCursorMove } from './custom-events';

/**
 * A model representing the contents of an editor at a point in time.
 * Text is stored by line. This class also keeps track of the current
 * position of the cursor within the document.
 */
export default class Document {
  constructor(options) {
    this.lines = [];
    this.lineStartIndexes = [];
    this.cursorLine = 0;
    this.cursorColumn = 0;
    this.lastSavedCursorColumn = 0;

    this.setText(options.initialValue || '');
  }

  getLine = index => this.lines[index];
  getLines = () => this.lines;
  getLineCount = () => this.lines.length;
  getText = () => this.lines.join('\n');
  getCursorPosition = () => ({
    cursorLine: this.cursorLine,
    cursorColumn: this.cursorColumn
  });

  updateLineAtCursor = (newLineText, newCursorColumn) => {
    this.setLine(this.cursorLine, newLineText);
    this.cursorColumn = newCursorColumn;
    this.lastSavedCursorColumn = this.cursorColumn;
    dispatchTextChange();
  };

  setLine = (index, newLineText) => {
    this.lines[index] = newLineText;
    this.calculateLineStartIndexes();
  };

  setText = newText => {
    this.lines = newText.split('\n');
    this.calculateLineStartIndexes();
  };

  setCursorPosition = (newCursorLine, newCursorColumn) => {
    this.cursorLine = newCursorLine;
    this.cursorColumn = newCursorColumn;
    this.lastSavedCursorColumn = newCursorColumn;
    const text = this.lines[this.cursorLine];
    dispatchCursorMove();
    return { text, cursorColumn: this.cursorColumn };
  };

  calculateLineStartIndexes = () => {
    let startIndex = 0;
    // TODO: can probably start at lineIndex here
    this.lineStartIndexes = this.lines.map(line => {
      const oldStartIndex = startIndex;
      startIndex = line.length + startIndex + 1;
      return oldStartIndex;
    });
  };

  insertLineBreakAtCursor = () => {
    if (this.cursorLine === this.lines.length - 1) {
      this.lines.push('');
    } else {
      this.lines.splice(this.cursorLine + 1, 0, '');
    }

    this.cursorLine += 1;
    this.cursorColumn = 0;

    dispatchTextChange();
    dispatchCursorMove(this.getCursorPosition());
    return { text: '', cursorColumn: this.cursorColumn };
  };

  moveCursorLineUp = () => {
    if (this.cursorLine === 0) {
      this.cursorColumn = 0;
      return { cursorColumn: this.cursorColumn };
    }

    const prevLine = this.lines[this.cursorLine - 1];
    this.cursorLine -= 1;
    this.cursorColumn = Math.min(this.lastSavedCursorColumn, prevLine.length);

    console.log();
    dispatchCursorMove(this.getCursorPosition());
    return { text: prevLine, cursorColumn: this.cursorColumn };
  };

  moveCursorLineDown = () => {
    if (this.cursorLine === this.lines.length - 1) {
      this.cursorColumn = this.lines[this.cursorLine].length;
      return { cursorColumn: this.cursorColumn };
    }

    const nextLine = this.lines[this.cursorLine + 1];
    this.cursorLine += 1;
    this.cursorColumn = Math.min(this.lastSavedCursorColumn, nextLine.length);

    dispatchCursorMove(this.getCursorPosition());
    return { text: nextLine, cursorColumn: this.cursorColumn };
  };

  moveCursorLineStart = () => {
    this.cursorColumn = 0;
    this.lastSavedCursorColumn = this.cursorColumn;

    dispatchCursorMove(this.getCursorPosition());
    return { cursorColumn: this.cursorColumn };
  };

  moveCursorLineEnd = () => {
    this.cursorColumn = this.lines[this.cursorLine].length;
    this.lastSavedCursorColumn = this.cursorColumn;

    dispatchCursorMove(this.getCursorPosition());
    return { cursorColumn: this.cursorColumn };
  };

  moveCursorColumnUp = () => {
    if (this.cursorColumn === this.lines[this.cursorLine].length) {
      this.cursorColumn = 0;
      this.lastSavedCursorColumn = this.cursorColumn;
      const ret = this.moveCursorLineDown();
      this.lastSavedCursorColumn = this.cursorColumn;

      dispatchCursorMove(this.getCursorPosition());
      return ret;
    }

    this.cursorColumn += 1;
    this.lastSavedCursorColumn = this.cursorColumn;

    dispatchCursorMove(this.getCursorPosition());
    return { cursorColumn: this.cursorColumn };
  };

  moveCursorColumnDown = () => {
    if (this.cursorColumn === 0) {
      this.cursorColumn = +Infinity;
      this.lastSavedCursorColumn = this.cursorColumn;
      const ret = this.moveCursorLineUp();
      this.lastSavedCursorColumn = this.cursorColumn;

      dispatchCursorMove(this.getCursorPosition());
      return ret;
    }

    this.cursorColumn -= 1;
    this.lastSavedCursorColumn = this.cursorColumn;

    dispatchCursorMove(this.getCursorPosition());
    return { cursorColumn: this.cursorColumn };
  };

  moveCursorDocumentStart = () => {
    this.cursorLine = 0;
    this.cursorColumn = 0;
    this.lastSavedCursorColumn = this.cursorColumn;
    const text = this.lines[this.cursorLine];

    dispatchCursorMove(this.getCursorPosition());
    return { cursorColumn: this.cursorColumn, text };
  };

  moveCursorDocumentEnd = () => {
    this.cursorLine = this.lines.length - 1;
    const text = this.lines[this.cursorLine];
    this.cursorColumn = text.length;
    this.lastSavedCursorColumn = this.cursorColumn;

    dispatchCursorMove(this.getCursorPosition());
    return { cursorColumn: this.cursorColumn, text };
  };
}
