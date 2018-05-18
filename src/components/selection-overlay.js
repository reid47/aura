import { el } from '../dom';

export default class SelectionOverlay {
  init = () => {
    return el(
      'div.Aura-selection-overlay',
      { ref: node => (this.node = node) },
      [
        el(
          'div.Aura-active-line',
          { ref: node => (this.activeLineNode = node) },
          [
            el('div.Aura-cursor', {
              ref: node => (this.cursorNode = node),
              role: 'presentation'
            })
          ]
        )
      ]
    );
  };

  setHeight = newHeight => {
    this.node.style.height = newHeight + 'px';
  };

  setLineHeight = newLineHeight => {
    this.activeLineNode.style.height = newLineHeight + 'px';
  };

  draw = (state, scrollInfo) => {
    const {
      focused,
      cursorLine,
      cursorColumn,
      lineHeight,
      characterWidth,
      firstVisibleLine,
      lastVisibleLine
    } = state;

    const { scrollLeft } = scrollInfo;

    if (!focused) return;
    if (cursorLine < firstVisibleLine) return;
    if (cursorLine > lastVisibleLine) return;

    const lineOffset = cursorLine * lineHeight;
    const columnOffset = cursorColumn * characterWidth - scrollLeft;
    this.activeLineNode.style.top = `${lineOffset}px`;
    this.cursorNode.style.transform = `translateX(${columnOffset}px)`;
  };
}
