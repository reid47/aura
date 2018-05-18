import { el } from '../dom';

export default class ScrollContainer {
  constructor({ onScroll }) {
    this.onScroll = onScroll;
  }

  init = children => {
    return el(
      'div.Aura-scroll-container',
      {
        ref: node => (this.node = node),
        on: {
          scroll: this.onScroll
        }
      },
      children
    );
  };

  getScrollInfo = () => {
    return this.node;
  };

  calculateVisibleLines = state => {
    const { lineHeight, lines } = state;
    const { scrollTop, scrollHeight, clientHeight } = this.node;

    if (scrollHeight <= clientHeight) {
      state.firstVisibleLine = 0;
      state.lastVisibleLine = Math.min(
        lines.length,
        Math.ceil(clientHeight / lineHeight)
      );
      return;
    }

    state.firstVisibleLine = Math.max(0, Math.floor(scrollTop / lineHeight));
    state.lastVisibleLine = Math.min(
      lines.length,
      Math.ceil((scrollTop + clientHeight + lineHeight) / lineHeight)
    );
  };
}
