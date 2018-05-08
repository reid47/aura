import { h, Component } from 'preact';
import { tokenize } from '../languages/js';
import { textareaEl } from './text-area';

export let overlayEl = null;

export default class HighlightOverlay extends Component {
  state = { cursorIndex: 0 };

  setRef = el => (overlayEl = el);

  render({ lines }, { cursorIndex }) {
    if (!textareaEl) return null;

    const lineHeight = 20; // TODO: make this configurable via font size
    const scrollTop = textareaEl.scrollTop;
    const scrollLeft = textareaEl.scrollLeft;
    const clientHeight = textareaEl.clientHeight;

    const firstVisibleLine = Math.max(0, Math.floor(scrollTop / lineHeight));
    const lastVisibleLine = Math.min(
      lines.length,
      Math.ceil((scrollTop + clientHeight + lineHeight) / lineHeight)
    );

    const marginTop = -(scrollTop % lineHeight);
    const marginLeft = -scrollLeft;

    const { formattedLines, cursorLine } = tokenize(lines, {
      firstVisibleLine,
      lastVisibleLine,
      cursorIndex
    });

    const elements = [];

    for (
      let lineIndex = firstVisibleLine;
      lineIndex <= lastVisibleLine;
      lineIndex++
    ) {
      const html = formattedLines[lineIndex];

      elements.push(
        <div
          key={lineIndex + html}
          className={`Aura-highlight-overlay-line ${
            cursorLine === lineIndex ? 'with-cursor' : ''
          }`}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      );
    }

    return (
      <div
        role="presentation"
        ref={this.setRef}
        style={{ marginTop, marginLeft }}
        className="Aura-highlight-overlay">
        {elements}
      </div>
    );
  }
}
