export default class Selection {
  constructor(root, document) {
    this.root = root;
    this.document = document;

    this.cursorLine = 0;
    this.cursorCol = 0;
  }

  moveCursorLineUp = () => {
    if (this.cursorLine > 0) {
      this.cursorLine--;
      this.notifySelectionChange();
    }
  };

  moveCursorLineDown = () => {
    if (this.cursorLine < this.document.getLineCount() - 1) {
      this.cursorLine++;
      this.notifySelectionChange();
    }
  };

  moveCursorColBackward = () => {
    if (this.cursorCol > 0) {
      this.cursorCol--;
      this.notifySelectionChange();
      return;
    }

    if (this.cursorLine > 0) {
      this.cursorCol = this.document.getLineLength(this.cursorLine - 1);
      this.cursorLine--;
      this.notifySelectionChange();
      return;
    }
  };

  moveCursorColForward = () => {
    const lineLength = this.document.getLineLength(this.cursorLine);

    if (this.cursorCol < lineLength) {
      this.cursorCol++;
    } else {
      this.cursorLine++;
      this.cursorCol = 0;
    }

    this.notifySelectionChange();
  };

  notifySelectionChange = () => {
    this.root.dispatchEvent(
      new CustomEvent('selectionChange', {
        detail: {
          cursorLine: this.cursorLine,
          cursorCol: this.cursorCol
        }
      })
    );
  };
}
