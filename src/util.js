export const el = (selector, props = {}) => {
  const [type, ...classNames] = selector.split('.');
  const el = document.createElement(type);
  classNames.forEach(cn => el.classList.add(cn));

  Object.keys(props).forEach(key => {
    if (key === 'style') {
      Object.keys(props[key]).forEach(styleKey => {
        el.style[styleKey] = props[key][styleKey];
      });

      return;
    }

    el.setAttribute(key, props[key]);
  });
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
  return (text.match(/\n/g) || []).length;
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

const htmlEntities = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
};

const escapeCache = {};

export const escape = text => {
  const cached = escapeCache[text];
  if (cached) return cached;
  const replaced = text.replace(/[&<>"'`=/]/g, c => htmlEntities[c]);
  return (escapeCache[text] = replaced);
};
