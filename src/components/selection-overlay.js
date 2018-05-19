import { el } from '../dom';

export default class SelectionOverlay {
  constructor({ document }) {
    this.document = document;
  }

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
        ),
        el('div.Aura-highlight-lines', {
          ref: node => (this.highlightLinesNode = node),
          role: 'presentation'
        })
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
    this.activeLineNode.hidden = true;
    this.highlightLinesNode.hidden = true;

    const {
      focused,
      lineHeight,
      characterWidth,
      firstVisibleLine,
      lastVisibleLine
    } = state;

    if (!focused) return;

    const {
      cursorLine,
      cursorColumn,
      selectionActive,
      selectionEndLine,
      selectionEndColumn
    } = this.document.getState();
    const { scrollLeft } = scrollInfo;

    if (
      !selectionActive &&
      cursorLine >= firstVisibleLine &&
      cursorLine <= lastVisibleLine
    ) {
      const lineOffset = cursorLine * lineHeight;
      const columnOffset = cursorColumn * characterWidth - scrollLeft;
      this.activeLineNode.style.top = `${lineOffset}px`;
      this.cursorNode.style.transform = `translateX(${columnOffset}px)`;
      this.activeLineNode.hidden = false;
    }

    if (selectionActive) {
      const lines = this.document.getLines();
      const selectionStartLine = Math.min(cursorLine, selectionEndLine);
      const realSelectionEndLine = Math.max(cursorLine, selectionEndLine);
      let selection = '';

      for (let line = firstVisibleLine; line <= lastVisibleLine; line++) {
        if (line < selectionStartLine || line > realSelectionEndLine) continue;
        const isFirstLineWithSelection = line === selectionStartLine;
        const isLastLineWithSelection = line === realSelectionEndLine;
        const text = lines[line];

        if (isFirstLineWithSelection && isLastLineWithSelection) {
          const selectionStartColumn = Math.min(
            cursorColumn,
            selectionEndColumn
          );

          const realSelectionEndColumn = Math.max(
            cursorColumn,
            selectionEndColumn
          );

          const selectedPart = text.substring(
            selectionStartColumn,
            realSelectionEndColumn
          );

          selection += `<span class="Aura-selection" style="top: ${line *
            lineHeight}px; left: ${selectionStartColumn *
            characterWidth}px">${selectedPart}</span>`;
        } else if (isFirstLineWithSelection) {
          const selectionStartColumn = Math.min(
            cursorColumn,
            selectionEndColumn
          );

          const selectedPart = text.substring(selectionStartColumn);

          selection += `<span class="Aura-selection" style="top: ${line *
            lineHeight}px; left: ${selectionStartColumn *
            characterWidth}px">${selectedPart + '&nbsp;'}</span>`;
        } else if (isLastLineWithSelection) {
          const realSelectionEndColumn = Math.max(
            cursorColumn,
            selectionEndColumn
          );
          const selectedPart = text.substring(0, realSelectionEndColumn);
          selection += `<span class="Aura-selection" style="top: ${line *
            lineHeight}px">${selectedPart}</span>`;
        } else {
          selection += `<span class="Aura-selection" style="top: ${line *
            lineHeight}px">${text + '&nbsp;'}</span>`;
        }
      }

      this.highlightLinesNode.innerHTML = selection;
      this.highlightLinesNode.hidden = false;
    }
  };
}
