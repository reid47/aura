let root;

(() => {
  if (typeof window.CustomEvent === 'function') return;

  function CustomEvent(event, params) {
    params = params || { detail: undefined };
    const evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.detail);
    return evt;
  }

  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent;
})();

export const initCustomEvents = (newRoot, evtHandlers = {}) => {
  root = newRoot;

  Object.keys(evtHandlers).forEach(evtType => {
    root.addEventListener(evtType, evtHandlers[evtType]);
  });
};

export const dispatchCursorMove = detail => {
  root.dispatchEvent(new CustomEvent('cursorMove', { detail }));
};

export const dispatchTextChange = detail => {
  root.dispatchEvent(new CustomEvent('textChange', { detail }));
};
