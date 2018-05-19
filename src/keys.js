export const keyCodes = {
  TAB: 9,
  ENTER: 13,
  ESCAPE: 27,
  END: 35,
  HOME: 36,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  COMMA: 188
};

export const keyCode = evt => evt.keyCode || evt.which;

export const ctrl = evt => evt.metaKey || evt.ctrlKey;
