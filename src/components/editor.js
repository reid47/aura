import { h, Component } from 'preact';
import announce from '../announce';
import getLocation from '../get-location';
import getContext from '../get-context';

export default class Editor extends Component {
  state = { value: this.props.initialValue };

  onInput = evt => this.setState({ value: evt.target.value });

  onKeyDown = evt => {
    if (!evt.ctrlKey) return;

    switch (evt.keyCode) {
      case 72:
        // Ctrl + H
        evt.preventDefault();
        announce('context', getContext(this.textarea), this.props);
        break;

      case 76:
        // Ctrl + L
        evt.preventDefault();
        announce('location', getLocation(this.textarea), this.props);
        break;
    }
  };

  render(options, { value }) {
    return (
      <div className="Ideally-wrapper">
        {!options.hideToolbar && (
          <div role="toolbar" className="Ideally-toolbar">
            <button className="Ideally-button">hi</button>
          </div>
        )}
        <textarea
          ref={el => (this.textarea = el)}
          className="Ideally-textarea"
          autocomplete="false"
          autocorrect="false"
          autocapitalize="false"
          spellCheck="false"
          defaultValue={value}
          onInput={this.onInput}
          onKeyDown={this.onKeyDown}
        />
      </div>
    );
  }
}
