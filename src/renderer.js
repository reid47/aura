import { el, on } from './dom';
import { escape, px } from './util';

/**
 * Responsible for drawing all of the visible portions of the editor in the DOM.
 */
export default class Renderer {
  constructor(root, document, session, options) {
    this.root = root;
    this.document = document;
    this.session = session;
    this.options = options;
  }

  /**
   * Initially creates the DOM structure that represents the editor based on the
   * given root `textarea`. Called once when the editor is intialized.
   */
  mount = () => {
    const makeRef = nodeName => node => (this[nodeName] = node);

    const els = el(
      'div.Aura-editor',
      {
        ref: makeRef('editorNode'),
        style: {
          fontFamily: this.session.getSetting('fontFamily'),
          fontSize: px(this.session.getSetting('fontSize')),
          lineHeight: px(this.session.getSetting('lineHeight'))
        }
      },
      el(
        'div.Aura-scroll-container',
        { ref: makeRef('scrollContainerNode') },
        el(
          'div.Aura-text-container',
          {},
          el(
            'div.Aura-overlays',
            { ref: makeRef('overlaysNode') },
            el(
              'div.Aura-selection-overlay',
              { ref: makeRef('selectionOverlayNode') },
              el('div.Aura-active-line', { ref: makeRef('activeLineNode') }),
              el('div.Aura-selection-layer', { ref: makeRef('selectionNode') }),
              el('div.Aura-cursor', { ref: makeRef('cursorNode') })
            )
          ),
          el('div.Aura-text-view', { ref: makeRef('textViewNode') })
        )
      )
    );

    this.root.parentNode.replaceChild(els, this.root);
    this.root.classList.add('Aura-input');
    els.insertBefore(this.root, els.firstChild);

    on(this.scrollContainerNode, 'scroll', this.render);
    on(this.scrollContainerNode, 'resize', this.render);
    on(this.scrollContainerNode, 'mousedown', this.session.selection.onMouseDown);

    this.render();
  };

  /**
   * Scrolls a given `Selection` into view, if it isn't already in view.
   */
  scrollIntoView = selection => {
    const { cursorLine } = selection;
    const { lineOverscan } = this.options;

    if (cursorLine < this.savedFirstVisibleLine + lineOverscan) {
      const lineHeight = this.session.getSetting('lineHeight');
      this.scrollContainerNode.scrollTop = cursorLine * lineHeight;
    } else if (cursorLine > this.savedLastVisibleLine - lineOverscan) {
      const lineHeight = this.session.getSetting('lineHeight');
      const { clientHeight } = this.scrollContainerNode;
      this.scrollContainerNode.scrollTop = (cursorLine + 1) * lineHeight - clientHeight;
    }
  };

  /**
   * Calculates (or recalculates) the overall width and height of all lines of text.
   */
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
      this.cursorNode.style.height = px(lineHeight);
    }

    const newTextWidth = px(longestLineLength * characterWidth);
    if (newTextWidth !== this.textWidth) {
      this.textWidth = newTextWidth;
      this.textViewNode.style.width = newTextWidth;
      this.overlaysNode.style.width = newTextWidth;
    }
  };

  /**
   * Determines the first and last visible lines on the screen, based on the current
   * scroll position, font size, client height, etc.
   */
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
      return { firstVisibleLine, lastVisibleLine };
    }

    const firstVisibleLine = Math.max(0, Math.floor(scrollTop / lineHeight) - lineOverscan);
    const lastVisibleLine = Math.min(
      lineCount,
      Math.ceil((scrollTop + clientHeight - lineHeight) / lineHeight) + lineOverscan
    );

    return { firstVisibleLine, lastVisibleLine };
  };

  /**
   * Draws visible lines of text to the screen.
   */
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
      for (let line = firstVisibleLine, i = 0; line <= lastVisibleLine; line++, i++) {
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
      for (let line = firstVisibleLine, i = 0; line <= lastVisibleLine; line++, i++) {
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
      visibleLineHtml.push(`<div class="Aura-line" style="top: ${top}">${escape(text)}</div>`);
    }

    this.textViewNode.innerHTML = visibleLineHtml.join('');
  };

  /**
   * Draws selection and cursor.
   */
  drawSelection = (firstVisibleLine, lastVisibleLine) => {
    this.activeLineNode.hidden = true;
    this.selectionNode.hidden = true;

    const {
      cursorLine,
      cursorCol,
      selectionActive,
      selectionEndLine,
      selectionEndCol
    } = this.session.selection;

    const lineHeight = this.session.getSetting('lineHeight');
    const characterWidth = this.session.getCharacterWidth();

    if (!selectionActive && cursorLine >= firstVisibleLine && cursorLine <= lastVisibleLine) {
      const lineOffset = px(cursorLine * lineHeight);
      const colOffset = px(cursorCol * characterWidth);
      this.cursorNode.style.top = lineOffset;
      this.cursorNode.style.transform = `translateX(${colOffset})`;
      this.activeLineNode.style.height = px(lineHeight);
      this.activeLineNode.style.top = lineOffset;
      this.activeLineNode.hidden = false;
    }

    if (!selectionActive) return;

    const lineOffset = px(selectionEndLine * lineHeight);
    const colOffset = px(selectionEndCol * characterWidth);
    this.cursorNode.style.top = lineOffset;
    this.cursorNode.style.transform = `translateX(${colOffset})`;

    const realSelectionStartLine = Math.min(cursorLine, selectionEndLine);
    const realSelectionEndLine = Math.max(cursorLine, selectionEndLine);
    if (realSelectionStartLine > lastVisibleLine || realSelectionEndLine < firstVisibleLine) return;

    const lines = this.document.getLines();
    let selection = '';

    for (let line = firstVisibleLine; line <= lastVisibleLine; line++) {
      if (line < realSelectionStartLine || line > realSelectionEndLine) continue;

      const isFirstLineWithSelection = line === realSelectionStartLine;
      const isLastLineWithSelection = line === realSelectionEndLine;
      const text = lines[line];
      const top = px(line * lineHeight);

      if (isFirstLineWithSelection && isLastLineWithSelection) {
        const realSelectionStartCol = Math.min(cursorCol, selectionEndCol);
        const realSelectionEndCol = Math.max(cursorCol, selectionEndCol);
        const selectedPart = text.substring(realSelectionStartCol, realSelectionEndCol);

        selection += `<span class="Aura-selection" style="top: ${top}; left: ${realSelectionStartCol *
          characterWidth}px">${selectedPart}</span>`;
      } else if (isFirstLineWithSelection) {
        const selectedPart = text.substring(cursorCol);

        selection += `<span class="Aura-selection" style="top: ${top}; left: ${cursorCol *
          characterWidth}px">${selectedPart + '&nbsp;'}</span>`;
      } else if (isLastLineWithSelection) {
        const selectedPart = text.substring(0, selectionEndCol);

        selection += `<span class="Aura-selection" style="top: ${top}">${selectedPart}</span>`;
      } else {
        selection += `<span class="Aura-selection" style="top: ${top}">${text + '&nbsp;'}</span>`;
      }
    }

    this.selectionNode.innerHTML = selection;
    this.selectionNode.hidden = false;
  };

  /**
   * Draws (or redraws) everything.
   */
  render = () => {
    const { scrollTop } = this.scrollContainerNode;

    this.calculateTextDimensions();
    const { firstVisibleLine, lastVisibleLine } = this.calculateVisibleLines();
    this.drawVisibleLines(firstVisibleLine, lastVisibleLine, scrollTop);
    this.drawSelection(firstVisibleLine, lastVisibleLine);

    this.savedScrollTop = scrollTop;
    this.savedFirstVisibleLine = firstVisibleLine;
    this.savedLastVisibleLine = lastVisibleLine;
  };
}
