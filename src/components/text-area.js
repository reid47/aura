import { h, Component } from 'preact';
import announce from '../announce';
import getLocation from '../get-location';
import getContext from '../get-context';

export let textareaEl = null;

export default class TextArea extends Component {
  setRef = el => (textareaEl = el);

  onKeyDown = evt => {
    this.props.onCursorMove(evt.target.selectionStart);

    if (!evt.ctrlKey) return;

    switch (evt.keyCode) {
      case 72:
        // Ctrl + H
        evt.preventDefault();
        announce('context', getContext(textareaEl), this.props);
        break;

      case 76:
        // Ctrl + L
        evt.preventDefault();
        announce('location', getLocation(this.textarea), this.props);
        break;
    }
  };

  onFocus = evt => this.props.onCursorMove(evt.target.selectionStart);

  onClick = evt => this.props.onCursorMove(evt.target.selectionStart);

  render({ noHighlight, readOnly, onInput, value }) {
    return (
      <textarea
        ref={this.setRef}
        className="Aura-textarea"
        autocomplete="false"
        autocorrect="false"
        autocapitalize="false"
        spellCheck="false"
        defaultValue={value}
        readOnly={readOnly}
        onInput={onInput}
        onFocus={this.onFocus}
        onKeyDown={this.onKeyDown}
        onClick={this.onClick}
        style={{ color: noHighlight ? '' : 'transparent' }}
      />
    );
  }
}
