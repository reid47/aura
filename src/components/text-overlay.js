import { el } from '../dom';
import { escape } from '../util';

export default class TextOverlay {
  constructor({ onMouseDown, document }) {
    this.onMouseDown = onMouseDown;
    this.document = document;
  }

  init = children => {
    return el(
      'div.Aura-text-overlay',
      { ref: node => (this.node = node), on: { mousedown: this.onMouseDown } },
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
}
