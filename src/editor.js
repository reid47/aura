import { el, on, appendNodes, countLines } from './util';
import { isEnter, isTab } from './key-events';
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

    this.lineNumbers = el('div.Aura-line-numbers', {
      role: 'presentation',
      readOnly: true,
      focusable: false,
      disabled: true
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
          appendNodes(this.textareaWrapper, this.textarea)
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
    const lineCount = this.lines.length;
    if (this.lastLineCount !== lineCount) {
      this.drawLineNumbers(lineCount);
      this.lastLineCount = lineCount;
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

  drawLineNumbers = lineCount => {
    let numbers = '';
    for (let i = 1; i <= lineCount + 1; i++) numbers += i + '\n';
    this.lineNumbers.innerHTML = numbers + '\n\n\n';

    const newLineNumberWidth = `${lineCount}`.length * this.fontSize + 'px';
    if (this.lastLineNumberWidth !== newLineNumberWidth) {
      this.lineNumbers.style.width = newLineNumberWidth;
      this.lastLineNumberWidth = newLineNumberWidth;
    }
  };

  onScroll = evt => {
    this.lineNumbers.scrollTop = evt.target.scrollTop;
  };

  onInput = evt => {
    this.setValue(evt.target.value, true);
  };

  onKeyDown = evt => {
    if (isEnter(evt)) {
      evt.preventDefault();

      const cursorIndex = this.textarea.selectionStart;
      const { indent, lastNonSpaceChar } = getIndentAtIndex(
        this.textarea,
        cursorIndex
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
