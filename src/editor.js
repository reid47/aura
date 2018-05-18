import { measureCharacterWidth } from './helpers/font-helper';
import TextArea from './components/textarea';
import Gutter from './components/gutter';
import ScrollContainer from './components/scroll-container';
import TextContainer from './components/text-container';
import TextOverlay from './components/text-overlay';
import Wrapper from './components/wrapper';
import SelectionOverlay from './components/selection-overlay';

export default class Editor {
  constructor(root, options = {}) {
    this.options = options;

    this.state = {
      lines: [],
      lineStartIndexes: {},
      cursorLine: 0,
      cursorColumn: 0,
      firstVisibleLine: 0,
      lastVisibleLine: 200,
      lastScrollTop: 0,
      focused: false
    };

    this.wrapper = new Wrapper({ options: this.options });

    this.textArea = new TextArea({
      onInput: this.onInput,
      onFocus: this.onTextAreaFocusChange.bind(true),
      onBlur: this.onTextAreaFocusChange.bind(false),
      drawSelectionOverlay: this.drawSelectionOverlay,
      getState: this.getState,
      options: this.options
    });

    this.scrollContainer = new ScrollContainer({
      onScroll: this.onScroll,
      options: this.options
    });

    this.gutter = new Gutter({ options: this.options });
    this.selectionOverlay = new SelectionOverlay({ options: this.options });
    this.textContainer = new TextContainer({ options: this.options });

    this.textOverlay = new TextOverlay({
      onMouseDown: this.onTextOverlayMouseDown,
      options: this.options
    });

    root.appendChild(
      this.wrapper.init([
        this.textArea.init(),
        this.scrollContainer.init([
          this.gutter.init(),
          this.textContainer.init([
            this.selectionOverlay.init(),
            this.textOverlay.init()
          ])
        ])
      ])
    );

    this.setFontSize(options.fontSize || 16);
    this.setLineHeight(options.lineHeight || this.fontSize * 1.5);
    this.setIndentSize(options.indentSize || 2);
    this.setTabInsertsIndent(options.tabInsertsIndent || true);
    this.setValue(options.initialValue || '');
    this.setDisableSyntaxHighlighting(
      options.disableSyntaxHighlighting || false
    );
  }

  getState = () => this.state;

  setValue = newValue => {
    this.state.lines = newValue.split('\n');
    let startIndex = 0;
    this.state.lineStartIndexes = this.state.lines.map(line => {
      const oldStartIndex = startIndex;
      startIndex = line.length + startIndex + 1;
      return oldStartIndex;
    });

    const contentHeight = this.state.lines.length * this.state.lineHeight;
    this.gutter.setHeight(contentHeight);
    // this.selectionOverlay.setHeight(contentHeight);
    this.textContainer.setHeight(contentHeight);
    this.textOverlay.setHeight(contentHeight);

    this.scrollContainer.calculateVisibleLines(this.state);
    this.textOverlay.draw(this.state);
    this.drawSelectionOverlay();

    const lineCount = this.state.lines.length;
    if (this.state.lastLineCount !== lineCount) {
      this.state.lastLineCount = lineCount;
      this.gutter.drawLineNumbers(this.state);
    }
  };

  setDisableSyntaxHighlighting = shouldDisable => {
    if (this.state.disableSyntaxHighlighting === shouldDisable) return;
    this.state.disableSyntaxHighlighting = shouldDisable;
    this.textOverlay.draw(this.state);
  };

  setIndentSize = newIndentSize => {
    if (this.state.indentSize === newIndentSize) return;
    this.state.indentSize = newIndentSize;
    this.state.indentString = '';
    for (let i = 0; i < newIndentSize; i++) this.state.indentString += ' ';
  };

  setFontSize = newFontSize => {
    newFontSize = parseInt(newFontSize, 10);
    if (this.fontSize === newFontSize) return;
    this.fontSize = newFontSize;
    this.wrapper.setFontSize(newFontSize);
    this.state.characterWidth = measureCharacterWidth(
      'monospace',
      this.fontSize
    );
  };

  setLineHeight = newLineHeight => {
    newLineHeight = parseInt(newLineHeight, 10);
    if (this.state.lineHeight === newLineHeight) return;
    this.state.lineHeight = newLineHeight;
    this.wrapper.setLineHeight(newLineHeight);
    this.selectionOverlay.setLineHeight(newLineHeight);
  };

  setTabInsertsIndent = tabInsertsIndent => {
    if (this.state.tabInsertsIndent === tabInsertsIndent) return;
    this.state.tabInsertsIndent = tabInsertsIndent;
  };

  onScroll = evt => {
    const newScrollTop = evt.target.scrollTop;
    if (newScrollTop === this.state.lastScrollTop) {
      this.textOverlay.draw(this.state);
      this.drawSelectionOverlay();
      return;
    }

    this.state.lastScrollTop = newScrollTop;
    this.scrollContainer.calculateVisibleLines(this.state);
    this.textOverlay.draw(this.state);
    this.gutter.drawLineNumbers(this.state);
    this.drawSelectionOverlay();
  };

  onInput = evt => {
    this.setValue(evt.target.value);
    this.textArea.calculateCursorPosition(this.state);
    this.drawSelectionOverlay();
  };

  onTextOverlayMouseDown = evt => {
    const rect = evt.currentTarget.getBoundingClientRect();
    const offsetX = evt.clientX - rect.left - 8; // subtract padding
    const offsetY = evt.clientY - rect.top;

    let clickedLine = 0;
    while (clickedLine * this.state.lineHeight < offsetY) {
      clickedLine++;
    }

    let charIndex = this.state.lineStartIndexes[clickedLine - 1];
    charIndex += Math.min(
      this.state.lines[clickedLine - 1].length,
      Math.round(offsetX / this.state.characterWidth)
    );

    setTimeout(() => {
      this.textArea.setSelection(charIndex);
      this.textArea.focus();
      this.textArea.calculateCursorPosition(this.state);
      this.drawSelectionOverlay();
    }, 0);
  };

  onTextAreaFocusChange = focused => {
    this.state.focused = focused;
    this.drawSelectionOverlay();
  };

  drawSelectionOverlay = () => {
    this.selectionOverlay.draw(
      this.state,
      this.scrollContainer.getScrollInfo()
    );
  };
}
