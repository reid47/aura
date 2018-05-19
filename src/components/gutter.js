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

  setHeight = newHeight => {
    this.lineNumbersNode.style.height = newHeight + 'px';
  };

  drawLineNumbers = state => {
    const {
      firstVisibleLine,
      lastVisibleLine,
      lineHeight,
      lastLineCount,
      characterWidth,
      lastLineNumberWidth
    } = state;

    let numbers = '';

    for (let line = firstVisibleLine; line < lastVisibleLine; line++) {
      numbers += `<div class="Aura-line-number" style="top: ${line *
        lineHeight}px">${line + 1}</div>`;
    }

    this.lineNumbersNode.innerHTML = numbers;

    const newLineNumberWidth =
      `${lastLineCount}`.length * characterWidth + 'px';
    if (lastLineNumberWidth !== newLineNumberWidth) {
      this.lineNumbersNode.style.width = newLineNumberWidth;
      state.lastLineNumberWidth = newLineNumberWidth;
    }
  };
}
