import { h, Component } from 'preact';
import { tokenize } from '../languages/js';

export default class HighlightOverlay extends Component {
  render({ lines, textarea, cursorLine = 6 }) {
    if (!textarea) return null;

    const formattedLines = tokenize(lines);
    const scrollTop = textarea.scrollTop;
    const lineHeight = 20; // TODO
    const firstVisiblePosition = scrollTop - lineHeight;
    const lastVisiblePosition = scrollTop + textarea.clientHeight + lineHeight;

    const lineElements = [];
    const marginTop = -(scrollTop % lineHeight);

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
        style={{ marginTop }}
        className="Aura-highlight-overlay">
        {lineElements}
      </div>
    );
  }
}
