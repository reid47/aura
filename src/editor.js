import { measureCharacterWidth } from './helpers/font-helper';
import TextArea from './components/textarea';
import Gutter from './components/gutter';
import ScrollContainer from './components/scroll-container';
import TextContainer from './components/text-container';
import TextOverlay from './components/text-overlay';
import Wrapper from './components/wrapper';
import SelectionOverlay from './components/selection-overlay';
import Document from './document';
import { initCustomEvents } from './custom-events';

export default class Editor {
  constructor(root, options = {}) {
    this.options = options;

    this.state = {
      firstVisibleLine: 0,
      lastVisibleLine: 0,
      lastScrollTop: 0,
      focused: false
    };

    this.document = new Document(options);
    this.wrapper = new Wrapper();
    this.textArea = new TextArea({
      onFocus: () => this.onTextAreaFocusChange(true),
      onBlur: () => this.onTextAreaFocusChange(false),
      options: this.options,
      document: this.document
    });
    this.scrollContainer = new ScrollContainer({
      onScroll: this.onScroll,
      options: this.options,
      document: this.document
    });
    this.gutter = new Gutter();
    this.selectionOverlay = new SelectionOverlay({ document: this.document });
    this.textContainer = new TextContainer();
    this.textOverlay = new TextOverlay({
      onMouseDown: this.onTextOverlayMouseDown,
      document: this.document,
      options: this.options
    });

    initCustomEvents(root, {
      textChange: this.drawTextOverlay,
      cursorMove: this.drawSelectionOverlay
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
    this.setDisableSyntaxHighlighting(
      options.disableSyntaxHighlighting || false
    );

    this.scrollContainer.calculateVisibleLines(this.state);
    this.drawTextOverlay();
  }

  drawTextOverlay = () => {
    const contentHeight = this.document.getLineCount() * this.state.lineHeight;
    const contentWidth =
      this.document.getLongestLineLength() * this.state.characterWidth;
    const gutterWidth =
      `${this.document.getLineCount()}`.length * this.state.characterWidth;

    this.gutter.setSize(gutterWidth, contentHeight);
    this.textContainer.setHeight(contentHeight);
    this.textOverlay.setSize(contentWidth, contentHeight);
    this.scrollContainer.calculateVisibleLines(this.state);
    this.gutter.drawLineNumbers(this.state);
    this.scrollContainer.calculateVisibleLines(this.state);
    this.textOverlay.draw(this.state);
    this.drawSelectionOverlay();
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

  onTextOverlayMouseDown = evt => {
    const rect = evt.currentTarget.getBoundingClientRect();
    const offsetX = evt.clientX - rect.left - 8; // subtract padding
    const offsetY = evt.clientY - rect.top;

    let newCursorLine = 0;
    while (newCursorLine * this.state.lineHeight < offsetY) {
      newCursorLine++;
    }
    newCursorLine--;

    const newCursorColumn = Math.min(
      this.document.getLine(newCursorLine).length,
      Math.round(offsetX / this.state.characterWidth)
    );

    this.textArea.updateState(
      this.document.setCursorPosition(newCursorLine, newCursorColumn)
    );

    setTimeout(() => {
      this.textArea.focus();
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
