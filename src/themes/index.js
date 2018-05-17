import defaultLight from './default-light';

const themes = {
  defaultLight
};

let currentThemeKey;

export function setTheme(els, themeKey = 'defaultLight') {
  const theme = themes[themeKey];
  if (!theme) throw new Error(`Could not apply unknown theme: ${themeKey}`);
  if (themeKey === currentThemeKey) return;

  els.gutter.style.color = theme.gutterTextColor;
  els.gutter.style.backgroundColor = theme.gutterBackgroundColor;
}
