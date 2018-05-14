import { el, on, appendNodes, debounce } from './util';
import * as keys from './key-events';
import { tokenize } from './languages/js';
import {
  insertTextAtCursor,
  deleteTextAtCursor,
  getIndentAtIndex,
  getCursorPositionFromIndex
} from './helpers/textarea-helper';
import { measureCharacterWidth } from './helpers/font-helper';

const indentAfterChars = { '{': 1, '(': 1 };

export default class Editor {
  constructor(root, options = {}) {
    this.root = root;
    this.options = options;

    this.wrapper = el('div.Aura-editor');
    this.codeWrapper = el('div.Aura-code-wrapper');
    this.textareaWrapper = el('div.Aura-textarea-wrapper');
    this.toolbar = el('div.Aura-toolbar', { role: 'toolbar' });

    this.syntaxHighlightOverlay = el('div.Aura-highlight-overlay', {
      role: 'presentation'
    });

    this.cursorOverlay = el('div.Aura-cursor-overlay', {
      role: 'presentation'
    });

    this.cursor = el('div.Aura-cursor', {
      role: 'presentation'
    });

    this.lineNumbers = el('div.Aura-line-numbers', {
      role: 'presentation'
    });

    this.textarea = el('textarea.Aura-textarea', {
      autocomplete: 'false',
      autocorrect: 'false',
      autocapitalize: 'false',
      spellCheck: 'false'
    });

    appendNodes(
      this.root,
      appendNodes(
        this.wrapper,
        this.toolbar,
        appendNodes(
          this.codeWrapper,
          this.lineNumbers,
          appendNodes(
            this.textareaWrapper,
            appendNodes(this.cursorOverlay, this.cursor),
            this.syntaxHighlightOverlay,
            this.textarea
          )
        )
      )
    );

    on(this.textarea, 'scroll', this.onScroll);
    on(this.textarea, 'input', this.onInput);
    on(this.textarea, 'keydown', this.onKeyDown);
    on(this.textarea, 'click', this.onClick);

    this.cursorLine = 0;
    this.cursorColumn = 0;

    this.setFontSize(options.fontSize || 16);
    this.setLineHeight(options.lineHeight || 20);
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
    if (!fromInput) this.textarea.value = newValue;
  };

  setIndentSize = newIndentSize => {
    if (this.indentSize === newIndentSize) return;
    this.indentSize = newIndentSize;
    this.indentString = '';
    for (let i = 0; i < newIndentSize; i++) this.indentString += ' ';
  };

  setFontSize = newFontSize => {
    if (this.fontSize === newFontSize) return;
    this.fontSize = newFontSize;
    this.wrapper.style.fontSize = newFontSize + 'px';
    this.characterWidth = measureCharacterWidth('monospace', this.fontSize);
  };

  setLineHeight = newLineHeight => {
    if (this.lineHeight === newLineHeight) return;
    this.lineHeight = newLineHeight;
    this.wrapper.style.lineHeight = newLineHeight + 'px';
  };

  setTabInsertsIndent = tabInsertsIndent => {
    if (this.tabInsertsIndent === tabInsertsIndent) return;
    this.tabInsertsIndent = tabInsertsIndent;
  };

  drawCursorOverlay = () => {
    this.cursorOverlay.style.display = 'none';
    if (this.textarea.selectionStart !== this.textarea.selectionEnd) return;
    if (this.cursorLine < this.firstVisibleLine) return;
    if (this.cursorLine > this.lastVisibleLine) return;

    const { scrollTop, scrollLeft } = this.textarea;
    const lineOffset = this.cursorLine * this.lineHeight - scrollTop;
    const columnOffset = this.cursorColumn * this.characterWidth - scrollLeft;
    this.cursorOverlay.style.transform = `translateY(${lineOffset}px)`;
    this.cursor.style.transform = `translateX(${columnOffset}px)`;
    this.cursorOverlay.style.display = 'block';
  };

  drawHighlightOverlay = () => {
    this.syntaxHighlightOverlay.innerHTML = tokenize({
      lines: this.lines,
      firstVisibleLine: this.firstVisibleLine,
      lastVisibleLine: this.lastVisibleLine,
      cursorIndex: this.textarea.selectionStart
    });

    const { scrollTop, scrollLeft } = this.textarea;
    const subtract = scrollTop ? this.lineHeight : 0;
    const offsetY = -(scrollTop % this.lineHeight) - subtract;
    const offsetX = -scrollLeft;

    this.syntaxHighlightOverlay.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  };

  drawLineNumbers = lineCount => {
    let numbers = '';
    for (let i = this.firstVisibleLine; i < this.lastVisibleLine; i++) {
      numbers += i + 1 + '\n';
    }

    const offset = this.textarea.scrollTop % this.lineHeight;
    this.lineNumbers.scrollTop = offset;
    this.lineNumbers.innerHTML = numbers + '\n\n\n\n';

    const newLineNumberWidth =
      `${lineCount}`.length * this.characterWidth + 'px';
    if (this.lastLineNumberWidth !== newLineNumberWidth) {
      this.lineNumbers.style.width = newLineNumberWidth;
      this.lastLineNumberWidth = newLineNumberWidth;
    }
  };

  calculateVisibleLines = () => {
    const { scrollTop, scrollHeight, clientHeight } = this.textarea;

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
      this.textarea.selectionStart
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

    this.lineNumbers.scrollTop += newScrollTop - this.lastScrollTop;
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

  onClick = evt => {
    this.calculateCursorPosition();
    this.drawCursorOverlay();
  };

  onKeyDown = evt => {
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
        this.textarea,
        this.textarea.selectionStart
      );

      const increaseIndent = indentAfterChars[lastNonSpaceChar];
      insertTextAtCursor(
        this.textarea,
        '\n' + indent + (increaseIndent ? this.indentString : '')
      );

      return;
    }

    if (keys.isTab(evt) && this.tabInsertsIndent) {
      evt.preventDefault();
      if (!evt.shiftKey) insertTextAtCursor(this.textarea, this.indentString);
      else deleteTextAtCursor(this.textarea, this.indentSize);
      return;
    }
  };
}
