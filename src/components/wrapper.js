import { el } from '../dom';

export default class Wrapper {
  init = children => {
    return el(
      'div.Aura-editor',
      {
        ref: node => (this.node = node)
      },
      children
    );
  };

  setFontSize = newFontSize => {
    this.node.style.fontSize = newFontSize + 'px';
  };

  setLineHeight = newLineHeight => {
    this.node.style.lineHeight = newLineHeight + 'px';
  };
}
