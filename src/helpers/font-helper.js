export const measureCharacterWidth = (fontFamily, fontSize) => {
  const temp = document.createElement('div');
  temp.style.fontFamily = fontFamily;
  temp.style.fontSize = fontSize;
  temp.style.position = 'absolute';
  temp.style.left = '-9999px';
  temp.innerHTML = 'x';
  document.body.appendChild(temp);
  const width = parseFloat(
    window.getComputedStyle(temp, null).getPropertyValue('width')
  );
  document.body.removeChild(temp);
  return width;
};
