import { h, Component } from 'preact';
import LineNumbers from './line-numbers';
import TextArea from './text-area';
import { countLines } from '../util';

export default class Editor extends Component {
  state = {
    value: this.props.initialValue,
    lineCount: countLines(this.props.initialValue)
  };

  onInput = evt => {
    const value = evt.target.value;
    this.setState({
      value,
      lineCount: countLines(value)
    });
  };

  render(options, { value, lineCount }) {
    return (
      <div className="Aura-editor">
        {!options.hideToolbar && (
          <div role="toolbar" className="Aura-toolbar">
            <button className="Aura-button">hi</button>
          </div>
        )}
        <div className="Aura-textarea-wrapper">
          {!options.hideLineNumbers && (
            <LineNumbers {...options} lineCount={lineCount} />
          )}
          <TextArea
            {...options}
            readOnly={options.readOnly}
            value={value}
            onInput={this.onInput}
          />
        </div>
      </div>
    );
  }
}
