import { el, on, appendNodes, countLines } from '../util';

export default function Editor(root, options = {}) {
  const setValue = (value, fromInput) => {
    const lineCount = countLines(value);
    drawLineNumbers(lineCount);
    if (!fromInput) textarea.value = value;
  };

  const setFontSize = newSize => {
    if (this.fontSize === newSize) return;
    this.fontSize = newSize;
    wrapper.style.fontSize = newSize + 'px';
  };

  const onInput = evt => {
    setValue(evt.target.value, true);
  };

  const onScroll = evt => {
    lineNumbers.scrollTop = evt.target.scrollTop;
  };

  const drawLineNumbers = lineCount => {
    if (this.lastLineCount === lineCount) return;
    this.lastLineCount = lineCount;

    const numbers = [];
    for (let i = 1; i <= lineCount + 1; i++) numbers.push(i);

    lineNumbers.style.width = `${lineCount}`.length * this.fontSize + 'px';
    lineNumbers.value = numbers.join('\n') + '\n\n\n\n';
  };

  const wrapper = el('div', {
    class: 'Aura-editor'
  });

  const toolbar = el('div', {
    class: 'Aura-toolbar',
    role: 'toolbar'
  });

  const codeWrapper = el('div', {
    class: 'Aura-code-wrapper'
  });

  const lineNumbers = el('textarea', {
    class: 'Aura-line-numbers',
    role: 'presentation',
    readOnly: true,
    focusable: false,
    disabled: true
  });

  const textareaWrapper = el('div', {
    class: 'Aura-textarea-wrapper'
  });

  const textarea = el('textarea', {
    class: 'Aura-textarea',
    autocomplete: 'false',
    autocorrect: 'false',
    autocapitalize: 'false',
    spellCheck: 'false'
  });

  appendNodes(
    root,
    appendNodes(
      wrapper,
      toolbar,
      appendNodes(
        codeWrapper,
        lineNumbers,
        appendNodes(textareaWrapper, textarea)
      )
    )
  );

  setFontSize(options.fontSize || 16);
  setValue(options.initialValue || '');

  on(textarea, 'input', onInput);
  on(textarea, 'scroll', onScroll);

  return {};
}
