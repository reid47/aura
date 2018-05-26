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

export const px = str => str + 'px';
