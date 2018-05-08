import { h, Component } from 'preact';
import { tokenize } from '../languages/js';

export default class HighlightOverlay extends Component {
  render({ lines, textarea, cursorLine = 6 }) {
    if (!textarea) return null;

    const formattedLines = tokenize(lines);
    const scrollTop = textarea.scrollTop;
    const scrollLeft = textarea.scrollLeft;
    const clientHeight = textarea.clientHeight;

    const lineHeight = 20; // TODO: make this configurable via font size
    const firstVisiblePosition = scrollTop - lineHeight;
    const lastVisiblePosition = scrollTop + clientHeight + lineHeight;

    const lineElements = [];
    const marginTop = -(scrollTop % lineHeight);
    const marginLeft = -scrollLeft;

    lines.map((line, lineIndex) => {
      const linePosition = lineHeight * lineIndex;
      const isVisible =
        linePosition > firstVisiblePosition &&
        linePosition < lastVisiblePosition;

      if (!isVisible) return;

      lineElements.push(
        <div
          key={lineIndex + line}
          className={`Aura-highlight-overlay-line ${
            cursorLine === lineIndex ? 'with-cursor' : ''
          }`}
          dangerouslySetInnerHTML={{ __html: formattedLines[lineIndex] || ' ' }}
        />
      );
    });

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
