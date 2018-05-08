import { h, Component } from 'preact';
import { tokenize } from '../languages/js';

export default class HighlightOverlay extends Component {
  render({ lines, textarea, cursorLine = 6 }) {
    if (!textarea) return null;

    const scrollTop = textarea.scrollTop;
    const scrollLeft = textarea.scrollLeft;
    const clientHeight = textarea.clientHeight;

    const lineHeight = 20; // TODO: make this configurable via font size

    const firstVisibleLine = Math.max(0, Math.floor(scrollTop / lineHeight));

    const lastVisibleLine = Math.min(
      lines.length,
      Math.ceil((scrollTop + clientHeight + lineHeight) / lineHeight)
    );

    const formattedLines = tokenize(lines, {
      firstVisibleLine,
      lastVisibleLine
    });

    const lineElements = [];
    const marginTop = -(scrollTop % lineHeight);
    const marginLeft = -scrollLeft;

    for (
      let lineIndex = firstVisibleLine;
      lineIndex <= lastVisibleLine;
      lineIndex++
    ) {
      const html = formattedLines[lineIndex];
      lineElements.push(
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
        style={{ marginTop, marginLeft }}
        className="Aura-highlight-overlay">
        {lineElements}
      </div>
    );
  }
}
