export const el = (selector, props = {}) => {
  const [type, ...classNames] = selector.split('.');
  const el = document.createElement(type);
  classNames.forEach(cn => el.classList.add(cn));
  Object.keys(props).forEach(key => el.setAttribute(key, props[key]));
  return el;
};

export const appendNodes = (node, ...children) => {
  children.forEach(child => node.appendChild(child));
  return node;
};

export const on = (node, event, handler) => {
  node.addEventListener(event, handler);
};

export const countLines = text => {
  if (!text) return 0;

  let index = 0;
  let lineCount = 0;
  const length = text.length;

  while (index < length) {
    if (text[index] === '\n') {
      lineCount++;
    }

    index++;
  }

  return lineCount;
};

export const getLineInfo = text => {
  if (!text) return 0;

  const lines = [''];
  let lineCount = 0;
  const charsToLines = {};

  let index = 0;
  const length = text.length;

  while (index < length) {
    charsToLines[index] = lineCount + 1;
    const char = text[index];

    if (char === '\n') {
      lineCount++;
      lines.push('');
    } else {
      lines[lineCount] += char;
    }

    index++;
  }

  return { lines, charsToLines };
};

export const splitIntoLines = text => {
  if (!text) return [];
  return text.split('\n');
};

export function debounce(func, wait, immediate) {
  let timeout;

  return function() {
    const context = this;
    const args = arguments;

    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };

    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}
