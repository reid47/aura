import { h, Component, options } from 'preact';
import LineNumbers from './line-numbers';
import TextArea, { textareaEl } from './text-area';
import HighlightOverlay, { overlayEl } from './highlight-overlay';
import { getLineInfo } from '../util';

export default class Editor extends Component {
  constructor(props) {
    super(props);

    const value = this.props.initialValue;
    const { lines, charsToLines } = getLineInfo(value);

    this.state = {
      value,
      lines,
      charsToLines,
      cursorLine: 0
    };
  }

  componentDidMount() {
    textareaEl.addEventListener('scroll', this.onScroll);
  }

  componentWillUnmount() {
    textareaEl.removeEventListener('scroll', this.onScroll);
  }

  onScroll = evt => {
    if (this.lineNumbers) {
      this.lineNumbers.scrollTop = evt.target.scrollTop;
    }

    if (this.overlay) {
      this.overlay.forceUpdate();
    }
  };

  onInput = evt => {
    const value = evt.target.value;
    const { lines, charsToLines } = getLineInfo(value);

    this.setState({
      value,
      lines,
      charsToLines
    });
  };

  onCursorMove = cursorIndex => {
    this.overlay && this.overlay.setState({ cursorIndex });
  };

  render(options, { value, lines, charsToLines, cursorLine }) {
    return (
      <div className="Aura-editor">
        {!options.hideToolbar && (
          <div role="toolbar" className="Aura-toolbar">
            <button className="Aura-button">hey</button>
          </div>
        )}
        <div className="Aura-code-wrapper">
          {!options.hideLineNumbers && (
            <LineNumbers
              {...options}
              lineNumbersRef={el => (this.lineNumbers = el)}
              lineCount={lines.length}
            />
          )}
          <div className="Aura-textarea-wrapper">
            {!options.noHighlight && (
              <HighlightOverlay
                ref={el => (this.overlay = el)}
                lines={lines}
                cursorLine={cursorLine}
              />
            )}
            <TextArea
              {...options}
              value={value}
              onInput={this.onInput}
              charsToLines={charsToLines}
              onCursorMove={this.onCursorMove}
            />
          </div>
        </div>
      </div>
    );
  }
}
