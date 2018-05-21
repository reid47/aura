import { el } from '../dom';
import { escape, px } from '../util';

export default class Renderer {
  constructor(root, document, session, options) {
    this.root = root;
    this.document = document;
    this.session = session;
    this.options = options;

    this.editorNode = null;
    this.scrollContainerNode = null;
    this.textViewNode = null;
  }

  mount = () => {
    const els = el(
      'div.Aura-editor',
      {
        ref: node => (this.editorNode = node),
        style: {
          fontSize: px(this.session.getSetting('fontSize')),
          lineHeight: px(this.session.getSetting('lineHeight'))
        }
      },
      el(
        'div.Aura-scroll-container',
        { ref: node => (this.scrollContainerNode = node) },
        el(
          'div.Aura-text-container',
          {},
          el(
            'div.Aura-overlays',
            { ref: node => (this.overlaysNode = node) },
            el(
              'div.Aura-selection-overlay',
              { ref: node => (this.selectionOverlayNode = node) },
              el(
                'div.Aura-active-line',
                { ref: node => (this.activeLineNode = node) },
                el('div.Aura-cursor', { ref: node => (this.cursorNode = node) })
              )
            )
          ),
          el('div.Aura-text-view', { ref: node => (this.textViewNode = node) })
        )
      )
    );

    this.root.parentNode.replaceChild(els, this.root);
    this.root.classList.add('Aura-input');
    els.insertBefore(this.root, els.firstChild);
    this.scrollContainerNode.addEventListener('scroll', this.render);
    this.scrollContainerNode.addEventListener(
      'mousedown',
      this.session.selection.onMouseDown
    );
    this.render();
  };

  scrollIntoView = selection => {
    const { cursorLine } = selection;
    const { lineOverscan } = this.options;

    if (cursorLine < this.savedFirstVisibleLine + lineOverscan) {
      const lineHeight = this.session.getSetting('lineHeight');
      this.scrollContainerNode.scrollTop = (cursorLine - 1) * lineHeight;
    } else if (cursorLine > this.savedLastVisibleLine - lineOverscan) {
      const lineHeight = this.session.getSetting('lineHeight');
      const { clientHeight } = this.scrollContainerNode;
      this.scrollContainerNode.scrollTop =
        (cursorLine + 1) * lineHeight - clientHeight;
    }
  };

  calculateTextDimensions = () => {
    const characterWidth = this.session.getCharacterWidth();
    const lineHeight = this.session.getSetting('lineHeight');
    const lineCount = this.document.getLineCount();
    const longestLineLength = this.document.getLongestLineLength();

    const newTextHeight = px(lineCount * lineHeight);
    if (newTextHeight !== this.textHeight) {
      this.textHeight = newTextHeight;
      this.textViewNode.style.height = newTextHeight;
      this.overlaysNode.style.height = newTextHeight;
      this.selectionOverlayNode.style.height = newTextHeight;
    }

    const newTextWidth = px(longestLineLength * characterWidth);
    if (newTextWidth !== this.textWidth) {
      this.textWidth = newTextWidth;
      this.textViewNode.style.width = newTextWidth;
      this.overlaysNode.style.width = newTextWidth;
    }
  };

  calculateVisibleLines = () => {
    const { scrollTop, scrollHeight, clientHeight } = this.scrollContainerNode;
    const lineCount = this.document.getLineCount();
    const lineHeight = this.session.getSetting('lineHeight');
    const { lineOverscan } = this.options;

    if (scrollHeight <= clientHeight) {
      const firstVisibleLine = 0;
      const lastVisibleLine = Math.min(
        lineCount,
        Math.ceil(clientHeight / lineHeight) + lineOverscan
      );
      return [firstVisibleLine, lastVisibleLine];
    }

    const firstVisibleLine = Math.max(
      0,
      Math.floor(scrollTop / lineHeight) - lineOverscan
    );
    const lastVisibleLine = Math.min(
      lineCount,
      Math.ceil((scrollTop + clientHeight - lineHeight) / lineHeight) +
        lineOverscan
    );

    return [firstVisibleLine, lastVisibleLine];
  };

  drawVisibleLines = (firstVisibleLine, lastVisibleLine, scrollTop) => {
    const lineHeight = this.session.getSetting('lineHeight');
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
      const firstVisibleTop = px(firstVisibleLine * lineHeight);
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
          lineNode.style.top = px(line * lineHeight);
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
      const top = px(line * lineHeight);
      visibleLineHtml.push(
        `<div class="Aura-line" style="top: ${top}">${escape(text)}</div>`
      );
    }

    this.textViewNode.innerHTML = visibleLineHtml.join('');
  };

  drawSelection = (firstVisibleLine, lastVisibleLine) => {
    this.activeLineNode.hidden = true;

    const {
      cursorLine,
      cursorCol,
      selectionActive
    } = this.session.selection.getState();

    if (
      !selectionActive &&
      cursorLine >= firstVisibleLine &&
      cursorLine <= lastVisibleLine
    ) {
      const lineHeight = this.session.getSetting('lineHeight');
      const characterWidth = this.session.getCharacterWidth();

      const columnOffset = cursorCol * characterWidth;
      this.activeLineNode.style.height = px(lineHeight);
      this.activeLineNode.style.top = px(cursorLine * lineHeight);
      this.cursorNode.style.transform = `translateX(${px(columnOffset)})`;
      this.cursorNode.style.animation = 'none';
      setTimeout(() => (this.cursorNode.style.animation = null), 0);
      this.activeLineNode.hidden = false;
    }
  };

  render = () => {
    const { scrollTop } = this.scrollContainerNode;

    this.calculateTextDimensions();
    const [firstVisibleLine, lastVisibleLine] = this.calculateVisibleLines();
    this.drawVisibleLines(firstVisibleLine, lastVisibleLine, scrollTop);
    this.drawSelection(firstVisibleLine, lastVisibleLine);

    this.savedScrollTop = scrollTop;
    this.savedFirstVisibleLine = firstVisibleLine;
    this.savedLastVisibleLine = lastVisibleLine;
  };
}
