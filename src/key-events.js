export const isEnter = evt => {
  return (evt.keyCode || evt.which) === 13;
};

export const isTab = evt => {
  return (evt.keyCode || evt.which) === 9;
};

export const isLeftArrow = evt => {
  return (evt.keyCode || evt.which) === 37;
};

export const isRightArrow = evt => {
  return (evt.keyCode || evt.which) === 39;
};

export const isUpArrow = evt => {
  return (evt.keyCode || evt.which) === 38;
};

export const isDownArrow = evt => {
  return (evt.keyCode || evt.which) === 40;
};

export const isNavigating = evt => {
  const keyCode = evt.keyCode || evt.which;
  switch (keyCode) {
    case 33: // page up
    case 34: // page down
    case 35: // end
    case 36: // home
    case 37: // left arrow
    case 38: // up arrow
    case 39: // right arrow
    case 40: // down arrow
      return true;
    default:
      return false;
  }
};
