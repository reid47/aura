import buildDom from './build-dom';
import detectLocation from './detect-location';
import announce from './announce';

function getVisibleLines(textarea) {
  const computedStyle = getComputedStyle(textarea);

  const lineHeight =
    parseFloat(computedStyle.getPropertyValue('line-height')) ||
    parseFloat(computedStyle.getPropertyValue('font-size')) ||
    16;

  const scrollTop = textarea.scrollTop;
  const visibleHeight = textarea.clientHeight;
  const firstVisiblePosition = scrollTop - lineHeight;
  const lastVisiblePosition = scrollTop + visibleHeight + lineHeight;

  const visibleLines = [];
  const lines = textarea.value.split(/(\r\n|\r|\n)/);

  lines.forEach((line, i) => {
    const linePosition = lineHeight * i;
    if (
      linePosition > firstVisiblePosition &&
      linePosition < lastVisiblePosition
    ) {
      visibleLines.push(line);
    }
  });

  return visibleLines;
}

export default function(root, options = {}) {
  root = typeof root === 'string' ? document.querySelector(root) : root;

  if (!root) {
    throw new Error('Failed to initialize: could not find root node.');
  }

  if (!root instanceof Element) {
    throw new Error('Root node must be a valid DOM element.');
  }

  if (typeof this === 'undefined') {
    throw new Error(
      '"this" is undefined. Editor must be instantiated with "new" keyword.'
    );
  }

  const { wrapper, textarea } = buildDom(root, options);

  if (options.value) {
    textarea.value = options.value;
  }

  textarea.addEventListener('keydown', evt => {
    if (!evt.ctrlKey) return;

    switch (evt.keyCode) {
      case 76:
        // Ctrl+L
        announce('location', detectLocation(textarea), options);
        evt.preventDefault();
        break;
    }
  });
}
