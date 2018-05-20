import { keyCode, keyCodes, ctrl } from '../keys';
import { dispatchCursorMove, dispatchLineTextChange } from '../custom-events';

/**
 * Wraps the inner `textarea` element that receives the input and
 * allows editing line-by-line. Responsible for handling keyboard
 * events while editing.
 */
export default class Input {
  constructor(root, options) {
    this.root = root;
    this.options = options;

    this.root.style.whiteSpace = 'pre';
    this.root.style.overflow = 'hidden';
    this.root.setAttribute('wrap', 'off');
    this.root.setAttribute('autocomplete', 'off');
    this.root.setAttribute('autocorrect', 'off');
    this.root.setAttribute('autocapitalize', 'off');
    this.root.setAttribute('spellcheck', 'false');

    this.root.addEventListener('input', this.onInput);
    this.root.addEventListener('keydown', this.onKeyDown);
  }

  focus = () => {
    setTimeout(() => this.root.focus(), 0);
  };

  setBuffer = newText => {
    this.root.value = newText;
  };

  setCursorCol = newCol => {
    this.root.selectionStart = this.root.selectionEnd = newCol;
  };

  onInput = evt => {
    this.notifyLineTextChange(evt.target.value, evt.target.selectionStart);
  };

  onKeyDown = evt => {
    const evtKeyCode = keyCode(evt);

    switch (evtKeyCode) {
      case keyCodes.LEFT:
      case keyCodes.RIGHT:
      case keyCodes.UP:
      case keyCodes.DOWN:
      case keyCodes.HOME:
      case keyCodes.END:
        evt.preventDefault();
        this.notifyCursorMove(evtKeyCode, ctrl(evt));
        return;
    }
  };

  notifyLineTextChange = (text, cursorCol) => {
    dispatchLineTextChange(this.root, { text, cursorCol });
  };

  notifyCursorMove = (direction, ctrlKey) => {
    dispatchCursorMove(this.root, { direction, ctrlKey });
  };
}
