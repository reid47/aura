import { on } from '../dom';
import { measureCharacterWidth } from '../helpers/font-helper';
import { keyCodes } from '../keys';
import Input from './input';
import Selection from './selection';

export default class Session {
  constructor(root, document, options) {
    this.root = root;
    this.document = document;
    this.options = options;
    this.input = new Input(this.root, this.document, this.options);
    this.selection = new Selection(this.root, this, this.document);

    this.document.setValue(this.options.initialValue || '');
    this.input.setBuffer(this.document.getLine(this.selection.cursorLine));

    on(this.root, 'lineTextChange', this.onLineTextChange);
    on(this.root, 'cursorMove', this.onCursorMove);
    on(this.root, 'selectionChange', this.onSelectionChange);
    on(this.root, 'lineBreakInsert', this.onLineBreakInsert);
    on(this.root, 'lineBreakDelete', this.onLineBreakDelete);
  }

  getSetting = settingName => {
    return this.options[settingName];
  };

  getCharacterWidth = () => {
    const { fontSize, fontFamily } = this.options;
    if (this.savedFontSize !== fontSize || this.savedFontFamily !== fontFamily) {
      this.characterWidth = measureCharacterWidth(fontFamily, fontSize);
      this.savedFontSize = fontSize;
      this.savedFontFamily = fontFamily;
    }

    return this.characterWidth;
  };

  onLineTextChange = ({ detail: { text, cursorLine, cursorCol } }) => {
    const changedLine = cursorLine != null ? cursorLine : this.selection.cursorLine;
    this.document.updateLine(changedLine, text);
    this.selection.setCursorPosition(changedLine, cursorCol);
  };

  onLineBreakInsert = ({ detail: { cursorCol } }) => {
    this.document.insertLineBreak(this.selection.cursorLine, cursorCol);
  };

  onLineBreakDelete = () => {
    this.document.deleteLineBreak(this.selection.cursorLine);
  };

  onCursorMove = ({ detail: { direction, shiftKey, ctrlKey } }) => {
    if (shiftKey && ctrlKey) {
      switch (direction) {
        case keyCodes.LEFT:
          return this.selection.selectWordBackward();
        case keyCodes.RIGHT:
          return this.selection.selectWordForward();
      }
    }

    if (shiftKey) {
      switch (direction) {
        case keyCodes.LEFT:
          return this.selection.selectColBackward();
        case keyCodes.RIGHT:
          return this.selection.selectColForward();
      }
    }

    if (ctrlKey) {
      switch (direction) {
        case keyCodes.LEFT:
          return this.selection.moveCursorWordBackward();
        case keyCodes.RIGHT:
          return this.selection.moveCursorWordForward();
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
