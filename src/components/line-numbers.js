import { h, Component } from 'preact';

export default class LineNumbers extends Component {
  render({ lineCount }) {
    let numbers = '';

    let i = 1;
    while (i <= lineCount + 1) {
      numbers += `${i}\n`;
      i++;
    }

    return (
      <div
        ref={el => (this.div = el)}
        className="Aura-line-numbers"
        role="presentation">
        {numbers + '\n\n\n\n'}
      </div>
    );
  }
}
