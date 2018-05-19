import { el } from '../dom';
import { escape } from '../util';

export default class TextOverlay {
  constructor({ textArea, document, getState, drawSelectionOverlay }) {
    this.textArea = textArea;
    this.document = document;
    this.getState = getState;
    this.drawSelectionOverlay = drawSelectionOverlay;
  }

  init = children => {
    return el(
      'div.Aura-text-overlay',
      {
        ref: node => (this.node = node),
        on: {
          mousedown: this.onMouseDown,
          mouseup: this.onMouseUp,
          mousemove: this.onMouseMove
        }
      },
      children
    );
  };

  setSize = (newWidth, newHeight) => {
    this.node.style.width = newWidth + 'px';
    this.node.style.height = newHeight + 'px';
  };

  draw = state => {
    const { firstVisibleLine, lastVisibleLine, lineHeight } = state;

    const lines = this.document.getLines();
    let visibleLines = '';
    for (let line = firstVisibleLine; line <= lastVisibleLine; line++) {
      const text = lines[line];
      if (!text) continue;

      visibleLines += `<div class="Aura-line" style="top: ${line *
        lineHeight}px">${escape(text)}</div>`;
    }

    this.node.innerHTML = visibleLines;
  };

  getCursorPositionFromEvent = evt => {
    const { characterWidth, lineHeight } = this.getState();
    const rect = evt.currentTarget.getBoundingClientRect();
    const offsetX = evt.clientX - rect.left;
    const offsetY = evt.clientY - rect.top;

    // TODO: binary search?
    let newCursorLine = 0;
    while (newCursorLine * lineHeight < offsetY) {
      newCursorLine++;
    }
    newCursorLine--;

    const newCursorColumn = Math.min(
      this.document.getLine(newCursorLine).length,
      Math.round(offsetX / characterWidth)
    );

    return [newCursorLine, newCursorColumn];
  };

  onMouseDown = evt => {
    this.isMouseDown = true;
    this.document.selectionActive = false;
    const [cursorLine, cursorColumn] = this.getCursorPositionFromEvent(evt);

    this.textArea.updateState(
      this.document.setCursorPosition(cursorLine, cursorColumn)
    );

    setTimeout(() => {
      this.textArea.focus();
      this.drawSelectionOverlay();
    }, 0);
  };

  onMouseUp = () => {
    this.isMouseDown = false;
  };

  onMouseMove = evt => {
    if (!this.isMouseDown) return;
    const [cursorLine, cursorColumn] = this.getCursorPositionFromEvent(evt);
    this.document.setSelectionEnd(cursorLine, cursorColumn);
    this.drawSelectionOverlay();
  };
}
