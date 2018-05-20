import { el } from '../dom';
import { escape } from '../util';

export default class Renderer {
  constructor(root, document, session, options) {
    this.root = root;
    this.document = document;
    this.session = session;
    this.options = options;

    this.lineHeight = 24; //this.options.lineHeight; // TODO
    this.editorNode = null;
    this.scrollContainerNode = null;
    this.textViewNode = null;
  }

  mount = () => {
    const els = el(
      'div.Aura-editor',
      { ref: node => (this.editorNode = node) },
      el(
        'div.Aura-scroll-container',
        { ref: node => (this.scrollContainerNode = node) },
        el('div.Aura-text-view', { ref: node => (this.textViewNode = node) })
      )
    );

    this.root.parentNode.replaceChild(els, this.root);
    this.root.classList.add('Aura-input');
    els.insertBefore(this.root, els.firstChild);
    this.scrollContainerNode.addEventListener('scroll', this.render);

    this.render();
  };

  calculateTextHeight = () => {
    const lineCount = this.document.getLineCount();
    const newTextHeight = lineCount * this.lineHeight;
    if (newTextHeight === this.textHeight) return;
    this.textHeight = newTextHeight;
    this.textViewNode.style.height = `${newTextHeight}px`;
  };

  calculateVisibleLines = () => {
    const { scrollTop, scrollHeight, clientHeight } = this.scrollContainerNode;
    const lineCount = this.document.getLineCount();

    if (scrollHeight <= clientHeight) {
      const firstVisibleLine = 0;
      const lastVisibleLine = Math.min(
        lineCount,
        Math.ceil(clientHeight / this.lineHeight)
      );
      return [firstVisibleLine, lastVisibleLine];
    }

    const firstVisibleLine = Math.max(
      0,
      Math.floor(scrollTop / this.lineHeight) - this.options.lineOverscan
    );
    const lastVisibleLine = Math.min(
      lineCount,
      Math.ceil(
        (scrollTop + clientHeight + this.lineHeight) / this.lineHeight
      ) + this.options.lineOverscan
    );

    return [firstVisibleLine, lastVisibleLine];
  };

  drawVisibleLines = (firstVisibleLine, lastVisibleLine, scrollTop) => {
    const lines = this.document.getLines();

    // An optimization: if the first and last visible lines are the same as
    // they were on the last render, just iterate through them and see if
    // any has new text and then return early
    if (
      firstVisibleLine === this.savedFirstVisibleLine &&
      lastVisibleLine === this.savedLastVisibleLine
    ) {
      for (
        let line = firstVisibleLine, i = 0;
        line <= lastVisibleLine;
        line++, i++
      ) {
        const text = lines[line] || ' ';
        const lineNode = this.textViewNode.childNodes[i];
        if (lineNode.innerText !== text) lineNode.innerHTML = escape(text);
      }

      return;
    }

    // Another optimization in the case that we're scrolling down:
    if (this.savedScrollTop < scrollTop) {
      // First, calculate the top px value for the first visible line.
      // Then, remove all DOM nodes for lines that don't have this value
      // (that is, all lines which come before this line, and are no longer
      // visible).
      const firstVisibleTop = `${firstVisibleLine * this.lineHeight}px`;
      while (
        this.textViewNode.firstChild &&
        this.textViewNode.firstChild.style.top !== firstVisibleTop
      ) {
        this.textViewNode.removeChild(this.textViewNode.firstChild);
      }

      // Then, for each visible line...
      for (
        let line = firstVisibleLine, i = 0;
        line <= lastVisibleLine;
        line++, i++
      ) {
        const text = lines[line] || ' ';
        let lineNode = this.textViewNode.childNodes[i];
        if (!lineNode) {
          // ...if we don't have a DOM node at this index, create a new one
          lineNode = document.createElement('div');
          lineNode.className = 'Aura-line';
          lineNode.style.top = `${line * this.lineHeight}px`;
          lineNode.innerHTML = escape(text);
          this.textViewNode.appendChild(lineNode);
        } else {
          // ...but if we do, just update its properties as necessary
          if (lineNode.innerText !== text) lineNode.innerHTML = escape(text);
        }
      }

      return;
    }

    // Otherwise, fall back to just creating a new DOM node for every line and
    // replacing all children of textViewNode
    const visibleLineHtml = [];
    for (let line = firstVisibleLine; line <= lastVisibleLine; line++) {
      const text = lines[line] || ' ';
      const top = line * this.lineHeight;
      visibleLineHtml.push(
        `<div class="Aura-line" style="top: ${top}px">${escape(text)}</div>`
      );
    }

    this.textViewNode.innerHTML = visibleLineHtml.join('');
  };

  render = () => {
    const { scrollTop } = this.scrollContainerNode;

    this.calculateTextHeight();
    const [firstVisibleLine, lastVisibleLine] = this.calculateVisibleLines();
    this.drawVisibleLines(firstVisibleLine, lastVisibleLine, scrollTop);

    this.savedScrollTop = scrollTop;
    this.savedFirstVisibleLine = firstVisibleLine;
    this.savedLastVisibleLine = lastVisibleLine;
  };
}
