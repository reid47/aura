import { on } from './util';
import constructDom from './construct-dom';
import * as keys from './key-events';
import tokenize from './languages/js/tokenize';
import {
  insertTextAtCursor,
  deleteTextAtCursor,
  getIndentAtIndex,
  getCursorPositionFromIndex
} from './helpers/textarea-helper';
import { measureCharacterWidth } from './helpers/font-helper';
import SettingsDialog from './settings-dialog';

const indentAfterChars = { '{': 1, '(': 1 };

export default class Editor {
  constructor(root, options = {}) {
    this.root = root;
    this.options = options;
    this.els = {};

    constructDom(this.root, this.options, this.els);

    this.settings = new SettingsDialog(this.els, this, this.options);

    on(this.els.textarea, 'scroll', this.onScroll);
    on(this.els.textarea, 'input', this.onInput);
    on(this.els.textarea, 'keydown', this.onTextareaKeyDown);
    on(this.els.textarea, 'click', this.onClick);
    on(this.els.settings, 'keydown', this.onSettingsKeyDown);

    this.cursorLine = 0;
    this.cursorColumn = 0;

    this.setFontSize(options.fontSize || 16);
    this.setLineHeight(options.lineHeight || this.fontSize * 1.5);
    this.setIndentSize(options.indentSize || 2);
    this.setTabInsertsIndent(options.tabInsertsIndent || true);
    this.setValue(options.initialValue || '');
  }

  setValue = (newValue, fromInput) => {
    this.lines = newValue.split('\n');
    let startIndex = 0;
    this.lineStartIndexes = this.lines.map(line => {
      const oldStartIndex = startIndex;
      startIndex = line.length + startIndex + 1;
      return oldStartIndex;
    });

    this.calculateVisibleLines();
    this.drawHighlightOverlay();

    const lineCount = this.lines.length;
    if (this.lastLineCount !== lineCount) {
      this.lastLineCount = lineCount;
      this.drawLineNumbers(lineCount);
    }
    if (!fromInput) this.els.textarea.value = newValue;
  };

  setIndentSize = newIndentSize => {
    if (this.indentSize === newIndentSize) return;
    this.indentSize = newIndentSize;
    this.indentString = '';
    for (let i = 0; i < newIndentSize; i++) this.indentString += ' ';
  };

  setFontSize = newFontSize => {
    newFontSize = parseInt(newFontSize, 10);
    if (this.fontSize === newFontSize) return;
    this.fontSize = newFontSize;
    this.els.wrapper.style.fontSize = newFontSize + 'px';
    this.characterWidth = measureCharacterWidth('monospace', this.fontSize);
  };

  setLineHeight = newLineHeight => {
    newLineHeight = parseInt(newLineHeight, 10);
    if (this.lineHeight === newLineHeight) return;
    this.lineHeight = newLineHeight;
    this.els.wrapper.style.lineHeight = `${newLineHeight}px`;
    this.els.cursorOverlay.style.height = `${newLineHeight}px`;
  };

  setTabInsertsIndent = tabInsertsIndent => {
    if (this.tabInsertsIndent === tabInsertsIndent) return;
    this.tabInsertsIndent = tabInsertsIndent;
  };

  focusTextArea = () => {
    this.els.textarea.focus();
  };

  disableTextArea = () => {
    this.els.textarea.setAttribute('disabled', 'true');
  };

  enableTextArea = () => {
    this.els.textarea.removeAttribute('disabled');
  };

  drawCursorOverlay = () => {
    this.els.cursorOverlay.style.display = 'none';
    if (this.els.textarea.selectionStart !== this.els.textarea.selectionEnd)
      return;
    if (this.cursorLine < this.firstVisibleLine) return;
    if (this.cursorLine > this.lastVisibleLine) return;

    const { scrollTop, scrollLeft } = this.els.textarea;
    const lineOffset = this.cursorLine * this.lineHeight - scrollTop;
    const columnOffset = this.cursorColumn * this.characterWidth - scrollLeft;
    this.els.cursorOverlay.style.transform = `translateY(${lineOffset}px)`;
    this.els.cursor.style.transform = `translateX(${columnOffset}px)`;
    this.els.cursorOverlay.style.display = 'block';
  };

  drawHighlightOverlay = () => {
    this.els.syntaxHighlightOverlay.innerHTML = tokenize({
      lines: this.lines,
      firstVisibleLine: this.firstVisibleLine,
      lastVisibleLine: this.lastVisibleLine,
      cursorIndex: this.els.textarea.selectionStart
    });

    const { scrollTop, scrollLeft } = this.els.textarea;
    const offsetY = -(scrollTop % this.lineHeight);
    const offsetX = -scrollLeft;

    this.els.syntaxHighlightOverlay.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  };

  drawLineNumbers = lineCount => {
    let numbers = '';
    for (let i = this.firstVisibleLine; i < this.lastVisibleLine; i++) {
      numbers += i + 1 + '\n';
    }

    const offset = this.els.textarea.scrollTop % this.lineHeight;
    this.els.lineNumbers.scrollTop = offset;
    this.els.lineNumbers.innerHTML = numbers + '\n\n\n\n';

    const newLineNumberWidth =
      `${lineCount}`.length * this.characterWidth + 'px';
    if (this.lastLineNumberWidth !== newLineNumberWidth) {
      this.els.lineNumbers.style.width = newLineNumberWidth;
      this.lastLineNumberWidth = newLineNumberWidth;
    }
  };

  calculateVisibleLines = () => {
    const { scrollTop, scrollHeight, clientHeight } = this.els.textarea;

    if (scrollHeight <= clientHeight) {
      this.firstVisibleLine = 0;
      this.lastVisibleLine = this.lines.length;
      return;
    }

    const lineHeight = this.lineHeight;

    this.firstVisibleLine = Math.max(0, Math.floor(scrollTop / lineHeight));
    this.lastVisibleLine = Math.min(
      this.lastLineCount,
      Math.ceil((scrollTop + clientHeight + lineHeight) / lineHeight)
    );
  };

  calculateCursorPosition = () => {
    const { cursorLine, cursorColumn } = getCursorPositionFromIndex(
      this.lineStartIndexes,
      this.els.textarea.selectionStart
    );

    this.cursorLine = cursorLine;
    this.cursorColumn = cursorColumn;
  };

  onScroll = evt => {
    const newScrollTop = evt.target.scrollTop;
    if (newScrollTop === this.lastScrollTop) {
      this.drawHighlightOverlay();
      this.drawCursorOverlay();
      return;
    }

    this.lastScrollTop = newScrollTop;
    this.calculateVisibleLines();
    this.drawHighlightOverlay();
    this.drawLineNumbers(this.lastLineCount);
    this.drawCursorOverlay();
  };

  onInput = evt => {
    this.setValue(evt.target.value, true);
    this.calculateCursorPosition();
    this.drawCursorOverlay();
  };

  onClick = () => {
    this.calculateCursorPosition();
    this.drawCursorOverlay();
  };

  onTextareaKeyDown = evt => {
    if (evt.ctrlKey) {
      if (keys.isComma(evt)) {
        this.settings.toggle();
      }
    }

    if (keys.isNavigating(evt)) {
      setTimeout(() => {
        this.calculateCursorPosition();
        this.drawCursorOverlay();
      }, 0);
      return;
    }

    if (keys.isEnter(evt)) {
      evt.preventDefault();

      const { indent, lastNonSpaceChar } = getIndentAtIndex(
        this.els.textarea,
        this.els.textarea.selectionStart
      );

      const increaseIndent = indentAfterChars[lastNonSpaceChar];
      insertTextAtCursor(
        this.els.textarea,
        '\n' + indent + (increaseIndent ? this.indentString : '')
      );

      return;
    }

    if (keys.isTab(evt) && this.tabInsertsIndent) {
      evt.preventDefault();
      if (!evt.shiftKey)
        insertTextAtCursor(this.els.textarea, this.indentString);
      else deleteTextAtCursor(this.els.textarea, this.indentSize);
      return;
    }
  };

  onSettingsKeyDown = evt => {
    if (evt.ctrlKey && keys.isComma(evt)) {
      this.settings.toggle();
      evt.preventDefault();
      return;
    }

    if (keys.isEscape(evt) && this.settings.isOpen()) {
      this.settings.close();
      evt.preventDefault();
      return;
    }
  };
}
