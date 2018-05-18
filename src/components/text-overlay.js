import { el } from '../dom';
import { escape } from '../util';

export default class TextOverlay {
  constructor({ onMouseDown }) {
    this.onMouseDown = onMouseDown;
  }

  init = children => {
    return el(
      'div.Aura-lines',
      {
        ref: node => (this.node = node),
        on: {
          mousedown: this.onMouseDown
        }
      },
      children
    );
  };

  setHeight = newHeight => {
    this.node.style.height = newHeight + 'px';
  };

  draw = state => {
    const { firstVisibleLine, lastVisibleLine, lineHeight, lines } = state;

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
