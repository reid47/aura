import { el } from '../dom';

export default class TextContainer {
  init = children => {
    return el(
      'div.Aura-textarea-wrapper',
      { ref: node => (this.node = node) },
      children
    );
  };

  setHeight = newHeight => {
    this.node.style.height = newHeight + 'px';
  };
}
