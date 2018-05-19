import { el } from '../dom';

export default class Gutter {
  init = () => {
    return el('div.Aura-gutter', { ref: node => (this.node = node) }, [
      el('div.Aura-line-numbers', {
        ref: node => (this.lineNumbersNode = node),
        role: 'presentation'
      })
    ]);
  };

  setSize = (newWidth, newHeight) => {
    if (newWidth !== this.lastWidth) {
      this.lastWidth = newWidth;
      this.lineNumbersNode.style.width = newWidth + 'px';
    }

    if (newHeight !== this.lastHeight) {
      this.lastHeight = newHeight;
      this.lineNumbersNode.style.height = newHeight + 'px';
    }
  };

  drawLineNumbers = state => {
    const { firstVisibleLine, lastVisibleLine, lineHeight } = state;

    let numbers = '';

    for (let line = firstVisibleLine; line < lastVisibleLine; line++) {
      numbers += `<div class="Aura-line-number" style="top: ${line *
        lineHeight}px">${line + 1}</div>`;
    }

    this.lineNumbersNode.innerHTML = numbers;
  };
}
