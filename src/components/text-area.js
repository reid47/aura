import { h, Component } from 'preact';
import announce from '../announce';
import getLocation from '../get-location';
import getContext from '../get-context';

export default class TextArea extends Component {
  componentDidMount() {
    this.lineNumbers = this.textarea.parentNode.querySelector(
      '.Aura-line-numbers'
    );
    this.textarea.addEventListener('scroll', this.onScroll);
  }

  componentWillUnmount() {
    this.textarea.removeEventListener('scroll', this.onScroll);
  }

  onScroll = evt => {
    if (!this.lineNumbers) return;
    this.lineNumbers.scrollTop = evt.target.scrollTop;
  };

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

  render({ readOnly, onInput, value }) {
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
      />
    );
  }
}
