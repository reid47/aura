const keyCodes = {
  9: 'Tab',
  27: 'Escape',
  37: 'ArrowLeft',
  38: 'ArrowUp',
  39: 'ArrowRight',
  40: 'ArrowDown',
  72: 'H',
  76: 'L'
};

export default function getKeyCombo(keyboardEvent) {
  const { which, keyCode, altKey, ctrlKey, metaKey, shiftKey } = keyboardEvent;
  const keyName = keyCodes[which || keyCode];

  if (keyName) {
    return [
      altKey && 'Alt',
      ctrlKey && 'Ctrl',
      metaKey && 'Meta',
      shiftKey && 'Shift',
      keyName
    ]
      .filter(Boolean)
      .join('+');
  }
}
