import { el, on, appendNodes, countLines } from './util';
import { keyCodes } from './constants';
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

    this.lineNumbers = el('textarea.Aura-line-numbers', {
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
    this.setIndentSize(options.indentSize || 2);
    this.setTabInsertsIndent(options.tabInsertsIndent || true);
    this.setValue(options.initialValue || '');
  }

  setValue = (newValue, fromInput) => {
    const lineCount = countLines(newValue);
    this.drawLineNumbers(lineCount);
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

  setTabInsertsIndent = tabInsertsIndent => {
    if (this.tabInsertsIndent === tabInsertsIndent) return;
    this.tabInsertsIndent = tabInsertsIndent;
  };

  drawLineNumbers = lineCount => {
    if (this.lastLineCount === lineCount) return;
    this.lastLineCount = lineCount;
    const numbers = [];
    for (let i = 1; i <= lineCount + 1; i++) numbers.push(i);

    this.lineNumbers.style.width = `${lineCount}`.length * this.fontSize + 'px';
    this.lineNumbers.value = numbers.join('\n') + '\n\n\n\n';
  };

  onScroll = evt => {
    this.lineNumbers.scrollTop = evt.target.scrollTop;
  };

  onInput = evt => {
    this.setValue(evt.target.value, true);
  };

  onKeyDown = evt => {
    if (evt.keyCode === keyCodes.enter) {
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

    if (evt.keyCode === keyCodes.tab && this.tabInsertsIndent) {
      evt.preventDefault();
      if (!evt.shiftKey) insertTextAtCursor(this.textarea, this.indentString);
      else deleteTextAtCursor(this.textarea, this.indentSize);
      return;
    }
  };
}
