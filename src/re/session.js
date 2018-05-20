import Selection from './selection';
import Input from './input';
import { keyCodes } from '../keys';
import { measureCharacterWidth } from '../helpers/font-helper';

export default class Session {
  constructor(root, document, options) {
    this.root = root;
    this.document = document;
    this.options = options;
    this.input = new Input(this.root, this.document, this.options);
    this.selection = new Selection(this.root, this.document);

    this.document.setValue(this.options.initialValue || '');
    this.input.setBuffer(this.document.getLine(this.selection.cursorLine));

    this.root.addEventListener('textChange', this.onTextChange);
    this.root.addEventListener('cursorMove', this.onCursorMove);
    this.root.addEventListener('selectionChange', this.onSelectionChange);
  }

  getSetting = settingName => {
    return this.options[settingName];
  };

  getCharacterWidth = () => {
    const { fontSize, fontFamily } = this.options;
    if (
      this.savedFontSize !== fontSize ||
      this.savedFontFamily !== fontFamily
    ) {
      this.characterWidth = measureCharacterWidth(fontFamily, fontSize);
      this.savedFontSize = fontSize;
      this.savedFontFamily = fontFamily;
    }

    return this.characterWidth;
  };

  onTextChange = ({ detail: { text } }) => {
    this.document.updateLine(this.selection.cursorLine, text);
  };

  onCursorMove = ({ detail: { direction, ctrlKey } }) => {
    switch (direction) {
      case keyCodes.UP:
        this.selection.moveCursorLineUp();
        return;
      case keyCodes.DOWN:
        this.selection.moveCursorLineDown();
        return;
      case keyCodes.LEFT:
        this.selection.moveCursorColBackward();
        return;
      case keyCodes.RIGHT:
        this.selection.moveCursorColForward();
        return;
      case keyCodes.HOME:
        ctrlKey
          ? this.selection.moveCursorDocumentStart()
          : this.selection.moveCursorLineStart();
        return;
      case keyCodes.END:
        ctrlKey
          ? this.selection.moveCursorDocumentEnd()
          : this.selection.moveCursorLineEnd();
        return;
    }
  };

  onSelectionChange = ({ detail: { cursorLine, cursorCol } }) => {
    this.input.setBuffer(this.document.getLine(cursorLine));
    this.input.setCursorCol(cursorCol);
  };
}
