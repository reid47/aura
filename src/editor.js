import { on, escape } from './util';
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
import { setTheme } from './themes';

const indentAfterChars = { '{': 1, '(': 1 };

export default class Editor {
  constructor(root, options = {}) {
    this.root = root;
    this.options = options;
    this.els = {};
    this.state = {
      lines: [],
      lineStartIndexes: {},
      cursorLine: 0,
      cursorColumn: 0,
      firstVisibleLine: 0,
      lastVisibleLine: 200,
      lastScrollTop: 0,
      focused: false
    };

    constructDom(this.root, this.options, this.els);
    setTheme(this.els, options.theme || 'defaultLight');

    this.settings = new SettingsDialog(this.els, this, this.options);

    on(this.els.scrollContainer, 'scroll', this.onScroll);
    on(this.els.textarea, 'input', this.onInput);
    on(this.els.textarea, 'focus', this.onTextAreaFocus);
    on(this.els.textarea, 'blur', this.onTextAreaBlur);
    on(this.els.textarea, 'keydown', this.onTextareaKeyDown);
    on(this.els.lines, 'mousedown', this.onLinesMouseDown);
    on(this.els.settings, 'keydown', this.onSettingsKeyDown);

    this.setFontSize(options.fontSize || 16);
    this.setLineHeight(options.lineHeight || this.fontSize * 1.5);
    this.setIndentSize(options.indentSize || 2);
    this.setTabInsertsIndent(options.tabInsertsIndent || true);
    this.setValue(options.initialValue || '');
    this.setDisableSyntaxHighlighting(
      options.disableSyntaxHighlighting || false
    );
  }

  setValue = (newValue, fromInput) => {
    this.state.lines = newValue.split('\n');
    let startIndex = 0;
    this.state.lineStartIndexes = this.state.lines.map(line => {
      const oldStartIndex = startIndex;
      startIndex = line.length + startIndex + 1;
      return oldStartIndex;
    });

    const contentHeight = this.state.lines.length * this.lineHeight;
    this.els.gutter.style.height = `${contentHeight}px`;
    this.els.textareaWrapper.style.height = `${contentHeight}px`;
    this.els.lines.style.height = `${contentHeight}px`;

    this.calculateVisibleLines();
    this.drawLines();
    this.drawCursorOverlay();

    const lineCount = this.state.lines.length;
    if (this.state.lastLineCount !== lineCount) {
      this.state.lastLineCount = lineCount;
      this.drawLineNumbers(lineCount);
    }

    if (!fromInput) this.els.textarea.value = newValue;
  };

  setDisableSyntaxHighlighting = shouldDisable => {
    if (this.disableSyntaxHighlighting === shouldDisable) return;
    this.disableSyntaxHighlighting = shouldDisable;
    this.drawLines();
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
    return this.els.textarea.focus();
  };

  disableTextArea = () => {
    this.els.textarea.setAttribute('disabled', 'true');
  };

  enableTextArea = () => {
    this.els.textarea.removeAttribute('disabled');
  };

  drawCursorOverlay = () => {
    this.els.cursorOverlay.hidden = true;
    if (!this.state.focused) return;
    if (this.els.textarea.selectionStart !== this.els.textarea.selectionEnd)
      return;
    if (this.state.cursorLine < this.state.firstVisibleLine) return;
    if (this.state.cursorLine > this.state.lastVisibleLine) return;

    const { scrollTop, scrollLeft } = this.els.scrollContainer;
    const lineOffset = this.state.cursorLine * this.lineHeight - scrollTop;
    const columnOffset =
      this.state.cursorColumn * this.characterWidth - scrollLeft;
    this.els.cursorOverlay.style.transform = `translateY(${lineOffset}px)`;
    this.els.cursor.style.transform = `translateX(${columnOffset}px)`;
    this.els.cursorOverlay.hidden = false;
  };

  drawLines = () => {
    let visibleLines = '';
    if (this.disableSyntaxHighlighting) {
      for (
        let line = this.state.firstVisibleLine;
        line <= this.state.lastVisibleLine;
        line++
      ) {
        visibleLines += `<div class="Aura-line" style="top: ${line *
          this.lineHeight}px">${escape(this.state.lines[line] || '')}</div>`;
      }
    } else {
      visibleLines = tokenize({
        lines: this.state.lines,
        firstVisibleLine: this.state.firstVisibleLine,
        lastVisibleLine: this.state.lastVisibleLine
      });
    }

    this.els.lines.innerHTML = visibleLines;
  };

  drawLineNumbers = () => {
    let numbers = '';

    for (
      let line = this.state.firstVisibleLine;
      line < this.state.lastVisibleLine;
      line++
    ) {
      numbers += `<div class="Aura-line-number" style="top: ${line *
        this.lineHeight}px">${line + 1}</div>`;
    }

    this.els.lineNumbers.innerHTML = numbers;

    const newLineNumberWidth =
      `${this.state.lastLineCount}`.length * this.characterWidth + 'px';
    if (this.state.lastLineNumberWidth !== newLineNumberWidth) {
      this.els.lineNumbers.style.width = newLineNumberWidth;
      this.state.lastLineNumberWidth = newLineNumberWidth;
    }
  };

  calculateVisibleLines = () => {
    const { scrollTop, scrollHeight, clientHeight } = this.els.scrollContainer;
    const lineHeight = this.lineHeight;

    if (scrollHeight <= clientHeight) {
      this.state.firstVisibleLine = 0;
      this.state.lastVisibleLine = Math.ceil(clientHeight / lineHeight);
      return;
    }

    this.state.firstVisibleLine = Math.max(
      0,
      Math.floor(scrollTop / lineHeight)
    );
    this.state.lastVisibleLine = Math.min(
      this.state.lines.length,
      Math.ceil((scrollTop + clientHeight + lineHeight) / lineHeight)
    );
  };

  calculateCursorPosition = () => {
    const { cursorLine, cursorColumn } = getCursorPositionFromIndex(
      this.state.lineStartIndexes,
      this.els.textarea.selectionStart
    );

    this.state.cursorLine = cursorLine;
    this.state.cursorColumn = cursorColumn;
  };

  onScroll = evt => {
    const newScrollTop = evt.target.scrollTop;
    if (newScrollTop === this.state.lastScrollTop) {
      this.drawLines();
      this.drawCursorOverlay();
      return;
    }

    this.state.lastScrollTop = newScrollTop;
    this.calculateVisibleLines();
    this.drawLines();
    this.drawLineNumbers();
    this.drawCursorOverlay();
  };

  onInput = evt => {
    this.setValue(evt.target.value, true);
    this.calculateCursorPosition();
    this.drawCursorOverlay();
  };

  onLinesMouseDown = evt => {
    const rect = evt.currentTarget.getBoundingClientRect();
    const offsetX = evt.clientX - rect.left - 8; // subtract padding
    const offsetY = evt.clientY - rect.top;

    let clickedLine = 0;
    while (clickedLine * this.lineHeight < offsetY) {
      clickedLine++;
    }

    let charIndex = this.state.lineStartIndexes[clickedLine - 1];
    charIndex += Math.min(
      this.state.lines[clickedLine - 1].length,
      Math.round(offsetX / this.characterWidth)
    );

    setTimeout(() => {
      this.els.textarea.setSelectionRange(charIndex, charIndex);
      this.els.textarea.focus();

      this.calculateCursorPosition();
      this.drawCursorOverlay();
    }, 0);
  };

  onTextAreaFocus = () => {
    this.state.focused = true;
    this.drawCursorOverlay();
  };

  onTextAreaBlur = () => {
    this.state.focused = false;
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
      const { indent, lastNonSpaceChar } = getIndentAtIndex(
        this.els.textarea,
        this.els.textarea.selectionStart
      );

      setTimeout(() => {
        const increaseIndent = indentAfterChars[lastNonSpaceChar];
        insertTextAtCursor(
          this.els.textarea,
          indent + (increaseIndent ? this.indentString : '')
        );
      }, 0);

      return;
    }

    // if (keys.isTab(evt) && this.tabInsertsIndent) {
    //   evt.preventDefault();
    //   if (!evt.shiftKey)
    //     insertTextAtCursor(this.els.textarea, this.indentString);
    //   else deleteTextAtCursor(this.els.textarea, this.indentSize);
    //   return;
    // }
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
