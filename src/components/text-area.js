import { h, Component } from 'preact';
import announce from '../announce';
import getLocation from '../get-location';
import getContext from '../get-context';

export default class TextArea extends Component {
  componentDidMount() {
    this.props.textareaRef(this.textarea);
  }

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

  render({ noHighlight, readOnly, onInput, value }) {
    return (
      <textarea
        ref={el => (this.textarea = el)}
        className="Aura-textarea"
        autocomplete="false"
        autocorrect="false"
        autocapitalize="false"
        spellCheck="false"
        defaultValue={value}
        readOnly={readOnly}
        onInput={onInput}
        onKeyDown={this.onKeyDown}
        style={{ color: noHighlight ? '' : 'transparent' }}
      />
    );
  }
}
