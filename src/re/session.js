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

  onTextChange = ({ detail: { text, cursorCol } }) => {
    this.document.updateLine(this.selection.cursorLine, text);
    this.selection.setCursorCol(cursorCol);
  };

  onCursorMove = ({ detail: { direction, ctrlKey } }) => {
    if (ctrlKey) {
      switch (direction) {
        case keyCodes.HOME:
          return this.selection.moveCursorDocumentStart();
        case keyCodes.END:
          return this.selection.moveCursorDocumentEnd();
      }
    }

    switch (direction) {
      case keyCodes.UP:
        return this.selection.moveCursorLineUp();
      case keyCodes.DOWN:
        return this.selection.moveCursorLineDown();
      case keyCodes.LEFT:
        return this.selection.moveCursorColBackward();
      case keyCodes.RIGHT:
        return this.selection.moveCursorColForward();
      case keyCodes.HOME:
        return this.selection.moveCursorLineStart();
      case keyCodes.END:
        return this.selection.moveCursorLineEnd();
    }
  };

  onSelectionChange = ({ detail: { cursorLine, cursorCol } }) => {
    this.input.setBuffer(this.document.getLine(cursorLine));
    this.input.setCursorCol(cursorCol);
  };
}
