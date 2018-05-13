import { el, on, appendNodes, debounce } from './util';
import { isEnter, isTab } from './key-events';
import { tokenize } from './languages/js';
import {
  insertTextAtCursor,
  deleteTextAtCursor,
  getIndentAtIndex
} from './textarea-helper';

const indentAfterChars = { '{': 1, '(': 1 };

export default class Editor {
  constructor(root, options = {}) {
    this.root = root;
    this.options = options;

    this.wrapper = el('div.Aura-editor');
    this.codeWrapper = el('div.Aura-code-wrapper');
    this.textareaWrapper = el('div.Aura-textarea-wrapper');
    this.toolbar = el('div.Aura-toolbar', { role: 'toolbar' });
    this.overlay = el('div.Aura-highlight-overlay', { role: 'presentation' });

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
          appendNodes(this.textareaWrapper, this.textarea, this.overlay)
        )
      )
    );

    on(this.textarea, 'scroll', this.onScroll);
    on(this.textarea, 'input', this.onInput);
    on(this.textarea, 'keydown', this.onKeyDown);

    this.setFontSize(options.fontSize || 16);
    this.setLineHeight(options.lineHeight || 20);
    this.setIndentSize(options.indentSize || 2);
    this.setTabInsertsIndent(options.tabInsertsIndent || true);
    this.setValue(options.initialValue || '');
  }

  setValue = (newValue, fromInput) => {
    this.lines = newValue.split('\n');
    this.calculateVisibleLines();
    this.drawOverlay();

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

  drawOverlay = () => {
    this.overlay.innerHTML = tokenize(this.lines, {
      firstVisibleLine: this.firstVisibleLine,
      lastVisibleLine: this.lastVisibleLine,
      cursorIndex: this.textarea.selectionStart
    });

    const scrollTop = this.textarea.scrollTop;
    const subtract = scrollTop ? this.lineHeight : 0;
    const offsetY = -(this.textarea.scrollTop % this.lineHeight) - subtract;
    const offsetX = -this.textarea.scrollLeft;

    this.overlay.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
  };

  drawLineNumbers = lineCount => {
    let numbers = '';
    for (let i = this.firstVisibleLine; i < this.lastVisibleLine; i++) {
      numbers += i + 1 + '\n';
    }

    const offset = this.textarea.scrollTop % this.lineHeight;
    this.lineNumbers.scrollTop = offset;
    this.lineNumbers.innerHTML = numbers + '\n\n\n\n';

    const newLineNumberWidth = `${lineCount}`.length * this.fontSize + 'px';
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

  onScroll = evt => {
    const newScrollTop = evt.target.scrollTop;
    if (newScrollTop === this.lastScrollTop) {
      this.drawOverlay();
      return;
    }

    this.lineNumbers.scrollTop += newScrollTop - this.lastScrollTop;
    this.lastScrollTop = newScrollTop;
    this.calculateVisibleLines();
    this.drawOverlay();
    this.drawLineNumbers(this.lastLineCount);
  };

  onInput = evt => {
    this.setValue(evt.target.value, true);
  };

  onKeyDown = evt => {
    if (isEnter(evt)) {
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

    if (isTab(evt) && this.tabInsertsIndent) {
      evt.preventDefault();
      if (!evt.shiftKey) insertTextAtCursor(this.textarea, this.indentString);
      else deleteTextAtCursor(this.textarea, this.indentSize);
      return;
    }
  };
}
