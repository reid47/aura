import { h, Component } from 'preact';
import LineNumbers from './line-numbers';
import TextArea from './text-area';
import HighlightOverlay from './highlight-overlay';
import { splitIntoLines } from '../util';

export default class Editor extends Component {
  state = {
    value: this.props.initialValue,
    lines: splitIntoLines(this.props.initialValue)
  };

  onInput = evt => {
    const value = evt.target.value;
    this.setState({
      value,
      lines: splitIntoLines(value)
    });
  };

  render(options, { value, lines }) {
    return (
      <div className="Aura-editor">
        {!options.hideToolbar && (
          <div role="toolbar" className="Aura-toolbar">
            <button className="Aura-button">hi</button>
          </div>
        )}
        <div className="Aura-code-wrapper">
          {!options.hideLineNumbers && (
            <LineNumbers {...options} lineCount={lines.length} />
          )}
          <div className="Aura-textarea-wrapper">
            {!options.noHighlight && (
              <HighlightOverlay lines={lines} textarea={this.textarea} />
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
