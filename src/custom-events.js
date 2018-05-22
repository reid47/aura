(() => {
  if (typeof window.CustomEvent === 'function') return;

  // Polyfill for browsers that do not support CustomEvents
  function CustomEvent(event, params) {
    params = params || { detail: true };
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, false, false, params.detail);
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent;
})();

export const dispatchCursorMove = (root, detail) => {
  root.dispatchEvent(new CustomEvent('cursorMove', { detail }));
};

export const dispatchLineBreak = (root, detail) => {
  root.dispatchEvent(new CustomEvent('lineBreak', { detail }));
};

export const dispatchLineTextChange = (root, detail) => {
  root.dispatchEvent(new CustomEvent('lineTextChange', { detail }));
};

export const dispatchSelectionChange = (root, detail) => {
  root.dispatchEvent(new CustomEvent('selectionChange', { detail }));
};
