import { el } from '../dom';
import { keyCodes, keyCode, ctrl } from '../keys';

export default class TextArea {
  constructor({ options, onBlur, onFocus, document }) {
    this.onBlur = onBlur;
    this.onFocus = onFocus;
    this.options = options;
    this.document = document;
  }

  init = () => {
    const elt = el('textarea.Aura-textarea', {
      ref: node => (this.node = node),
      autocomplete: 'false',
      autocorrect: 'false',
      autocapitalize: 'false',
      spellCheck: 'false',
      'aria-label': this.options.editorAreaLabel || 'code editor',
      on: {
        input: this.onInput,
        focus: this.onFocus,
        blur: this.onBlur,
        keydown: this.onKeyDown
      }
    });

    elt.value = this.document.getLine(0);
    return elt;
  };

  focus = () => this.node.focus();

  updateState = ({ text, cursorColumn }) => {
    if (text != null) {
      this.node.value = text;
    }

    if (cursorColumn != null) {
      this.node.selectionStart = this.node.selectionEnd = cursorColumn;
    }
  };

  onInput = evt => {
    this.document.updateLineAtCursor(
      evt.target.value,
      evt.target.selectionStart
    );
  };

  onKeyDown = evt => {
    switch (keyCode(evt)) {
      case keyCodes.BACKSPACE:
        if (this.node.selectionStart !== 0) return;
        evt.preventDefault();
        this.updateState(this.document.removeLineBreakAtCursor());
        return;

      case keyCodes.ENTER:
        evt.preventDefault();
        this.updateState(this.document.insertLineBreakAtCursor());
        return;

      case keyCodes.LEFT:
        evt.preventDefault();
        this.updateState(this.document.moveCursorColumnDown());
        return;

      case keyCodes.RIGHT:
        evt.preventDefault();
        this.updateState(this.document.moveCursorColumnUp());
        return;

      case keyCodes.UP:
        evt.preventDefault();
        this.updateState(this.document.moveCursorLineUp());
        return;

      case keyCodes.DOWN:
        evt.preventDefault();
        this.updateState(this.document.moveCursorLineDown());
        return;

      case keyCodes.HOME:
        evt.preventDefault();
        this.updateState(
          ctrl(evt)
            ? this.document.moveCursorDocumentStart()
            : this.document.moveCursorLineStart()
        );
        return;

      case keyCodes.END:
        evt.preventDefault();
        this.updateState(
          ctrl(evt)
            ? this.document.moveCursorDocumentEnd()
            : this.document.moveCursorLineEnd()
        );
        return;
    }
  };
}
