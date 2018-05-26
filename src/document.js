import { dispatchLineTextChange } from './custom-events';

/**
 * Represents the text content of an `Editor`.
 *
 * Text is stored as an array of strings, one for each line.
 */
export default class Document {
  constructor(root, options) {
    this.root = root;
    this.options = options;

    this.lines = [];
    this.longestLineLength = 0;
  }

  /**
   * Gets all lines in document.
   */
  getLines = () => this.lines;

  /**
   * Gets the string value of the line at `lineIndex`.
   */
  getLine = lineIndex => this.lines[lineIndex];

  /**
   * Gets the length of the line at `lineIndex`.
   */
  getLineLength = lineIndex => this.lines[lineIndex].length;

  /**
   * Gets the length of the longest line in the document.
   */
  getLongestLineLength = () => this.longestLineLength;

  /**
   * Gets the total number of lines in the document.
   */
  getLineCount = () => this.lines.length;

  /**
   * Gets the current value of the document as a single string, with lines
   * joined by `options.lineSeparator`
   */
  getValue = () => this.lines.join(this.options.lineSeparator);

  /**
   * Given a string, sets value of full document to that string,
   * replacing any existing lines.
   */
  setValue = newValue => {
    this.lines = newValue.split(/\r\n|\r|\n/);
    this.longestLineLength = 0;
    this.lines.forEach(line => {
      if (line.length > this.longestLineLength) this.longestLineLength = line.length;
    });
  };

  /**
   * Updates the line at given `lineIndex` to be `newValue`.
   */
  updateLine = (lineIndex, newValue) => {
    this.lines[lineIndex] = newValue;
    if (newValue.length > this.longestLineLength) this.longestLineLength = 0;
  };

  /**
   * Inserts a line break at the given line and column.
   */
  insertLineBreak = (lineIndex, colIndex) => {
    const currentLine = this.lines[lineIndex];

    // If at the very beginning of a line:
    if (colIndex === 0) {
      // insert a new blank line at this index
      this.lines.splice(lineIndex, 0, '');
      // and set the new line at cursor to be either the next line or a blank line
      this.notifyLineTextChange(this.lines[lineIndex + 1] || '', lineIndex + 1, 0);
      return;
    }

    // If at the very end of a line:
    if (colIndex === currentLine.length) {
      // insert a new blank line at the next index
      this.lines.splice(lineIndex + 1, 0, '');
      // and set the new line at cursor to be that blank next line
      this.notifyLineTextChange('', lineIndex + 1, 0);
      return;
    }

    // Otherwise, we're somewhere in the middle of a line, so we split it up
    const firstPart = currentLine.substring(0, colIndex);
    const secondPart = currentLine.substring(colIndex);
    // the current line now contains just the first part
    this.lines[lineIndex] = firstPart;
    // and the new next line contains the second part
    this.lines.splice(lineIndex + 1, 0, secondPart);
    this.notifyLineTextChange(secondPart, lineIndex + 1, 0);
  };

  /**
   * Deletes a given line from the document.
   */
  deleteLineBreak = lineIndex => {
    const currentLine = this.lines[lineIndex];
    const prevLine = this.lines[lineIndex - 1] || '';
    this.lines.splice(lineIndex, 1);
    this.notifyLineTextChange(prevLine + currentLine, Math.max(0, lineIndex - 1), prevLine.length);
  };

  /**
   * Raises a `lineTextChange` event on the DOM node.
   */
  notifyLineTextChange = (text, cursorLine, cursorCol) => {
    dispatchLineTextChange(this.root, { text, cursorLine, cursorCol });
  };
}
