export const keyCodes = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  ESCAPE: 27,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  DELETE: 46,
  COMMA: 188
};

export const keyCode = evt => evt.keyCode || evt.which;

export const ctrl = evt => evt.metaKey || evt.ctrlKey;

export const shift = evt => evt.shiftKey;
