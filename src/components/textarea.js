import { el } from '../dom';
import * as keys from '../key-events';
import {
  insertTextAtCursor,
  deleteTextAtCursor,
  getIndentAtIndex,
  getCursorPositionFromIndex
} from '../helpers/textarea-helper';

const indentAfterChars = { '{': 1, '(': 1 };

export default class TextArea {
  constructor({
    options,
    onInput,
    onBlur,
    onFocus,
    drawSelectionOverlay,
    getState
  }) {
    this.onInput = onInput;
    this.onBlur = onBlur;
    this.onFocus = onFocus;
    this.drawSelectionOverlay = drawSelectionOverlay;
    this.getState = getState;
    this.options = options;
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

    if (this.options.initialValue) {
      elt.value = this.options.initialValue;
    }

    return elt;
  };

  focus = () => {
    this.node.focus();
  };

  setSelection = (start, end = start) => {
    this.node.setSelectionRange(start, end);
  };

  calculateCursorPosition = state => {
    const { cursorLine, cursorColumn } = getCursorPositionFromIndex(
      state.lineStartIndexes,
      this.node.selectionStart
    );

    state.cursorLine = cursorLine;
    state.cursorColumn = cursorColumn;
  };

  onKeyDown = evt => {
    const state = this.getState();

    if (keys.isNavigating(evt)) {
      setTimeout(() => {
        this.calculateCursorPosition(state);
        this.drawSelectionOverlay();
      }, 0);
      return;
    }

    if (keys.isEnter(evt)) {
      const { indent, lastNonSpaceChar } = getIndentAtIndex(
        this.node,
        this.node.selectionStart
      );

      setTimeout(() => {
        const increaseIndent = indentAfterChars[lastNonSpaceChar];
        insertTextAtCursor(
          this.node,
          indent + (increaseIndent ? state.indentString : '')
        );
      }, 0);

      return;
    }

    if (keys.isTab(evt) && state.tabInsertsIndent) {
      evt.preventDefault();
      if (!evt.shiftKey) insertTextAtCursor(this.node, state.indentString);
      else deleteTextAtCursor(this.node, state.indentSize);
      return;
    }
  };
}
