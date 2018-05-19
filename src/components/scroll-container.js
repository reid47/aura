import { el } from '../dom';

export default class ScrollContainer {
  constructor({ onScroll, document }) {
    this.onScroll = onScroll;
    this.document = document;
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

  getScrollInfo = () => this.node;

  calculateVisibleLines = state => {
    const { lineHeight } = state;
    const { scrollTop, scrollHeight, clientHeight } = this.node;
    const lineCount = this.document.getLineCount();

    if (scrollHeight <= clientHeight) {
      state.firstVisibleLine = 0;
      state.lastVisibleLine = Math.min(
        lineCount,
        Math.ceil(clientHeight / lineHeight)
      );
      return;
    }

    state.firstVisibleLine = Math.max(0, Math.floor(scrollTop / lineHeight));
    state.lastVisibleLine = Math.min(
      lineCount,
      Math.ceil((scrollTop + clientHeight + lineHeight) / lineHeight)
    );
  };
}
