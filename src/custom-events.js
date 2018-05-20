(() => {
  if (typeof window.CustomEvent === 'function') return;

  // Polyfill for browsers that do not support CustomEvents
  function CustomEvent(event, params) {
    params = params || { detail: undefined };
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.detail);
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent;
})();

export const dispatchCursorMove = (root, detail) => {
  root.dispatchEvent(new CustomEvent('cursorMove', { detail }));
};

export const dispatchTextChange = (root, detail) => {
  root.dispatchEvent(new CustomEvent('textChange', { detail }));
};

export const dispatchSelectionChange = (root, detail) => {
  root.dispatchEvent(new CustomEvent('selectionChange', { detail }));
};
