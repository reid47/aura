import { h, Component } from 'preact';
import LineNumbers from './line-numbers';
import TextArea from './text-area';
import HighlightOverlay from './highlight-overlay';
import { getLineInfo } from '../util';

export default class Editor extends Component {
  constructor(props) {
    super(props);

    const value = this.props.initialValue;
    const { lines, lineInfo } = getLineInfo(value);

    this.state = {
      value,
      lines,
      lineInfo
    };
  }

  componentDidMount() {
    this.textarea.addEventListener('scroll', this.onScroll);
  }

  componentWillUnmount() {
    this.textarea.removeEventListener('scroll', this.onScroll);
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
    const { lines, lineInfo } = getLineInfo(value);
    this.setState({
      value,
      lines,
      lineInfo
    });
  };

  render(options, { value, lines }) {
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
                textarea={this.textarea}
              />
            )}
            <TextArea
              {...options}
              textareaRef={el => (this.textarea = el)}
              value={value}
              onInput={this.onInput}
            />
          </div>
        </div>
      </div>
    );
  }
}
