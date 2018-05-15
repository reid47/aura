const wordSeparator = /^[ \t\n\r.,\-:;()[\]$&{}]/;
const allDigits = /^\d+$/;
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

const escape = text => {
  const cached = escapeCache[text];
  if (cached) return cached;
  const replaced = text.replace(/[&<>"'`=/]/g, c => htmlEntities[c]);
  return (escapeCache[text] = replaced);
};

const tokenCaches = {
  js: {},
  css: {},
  html: {}
};

const markToken = (mode, type, text) => {
  const cached = tokenCaches[mode][text];
  if (cached) return cached;
  const marked = `<span class="Aura-token ${mode} ${type}">${text}</span>`;
  return (tokenCaches[mode][text] = marked);
};

const specialWords = {
  const: 1,
  let: 1,
  var: 1,
  function: 1,
  return: 1,
  import: 1,
  export: 1,
  from: 1,
  default: 1,
  else: 1,
  if: 1,
  for: 1,
  while: 1,
  do: 1,
  async: 1,
  await: 1,
  switch: 1,
  case: 1,
  break: 1,
  continue: 1,
  try: 1,
  catch: 1,
  throw: 1,
  class: 1,
  extends: 1,
  new: 1,
  yield: 1,
  true: 2,
  false: 2,
  typeof: 3,
  instanceof: 3
};

const specialWordRegex = new RegExp(
  '^(' + Object.keys(specialWords).join('|') + ')$'
);

const specialWordTypes = {
  1: 'keyword',
  2: 'boolean',
  3: 'operator'
};

export default function tokenize({ lines, firstVisibleLine, lastVisibleLine }) {
  const mode = 'js'; // TODO: make this configurable
  const length = lines.length;
  let formattedLines = '';

  let buffer = '';
  let inSingleQuotedString;
  let inDoubleQuotedString;

  for (let lineIndex = 0; lineIndex < length; lineIndex++) {
    inSingleQuotedString = false;
    inDoubleQuotedString = false;

    const isVisible =
      lineIndex >= firstVisibleLine && lineIndex <= lastVisibleLine;

    if (!isVisible) continue;

    const line = lines[lineIndex];
    const lineLength = line.length;

    if (lineIndex > firstVisibleLine) formattedLines += '\n';

    buffer = '';

    for (let column = 0; column < lineLength; column++) {
      const char = line[column];
      const charCode = char.charCodeAt(0);

      if (charCode === 39) {
        // single-quote
        buffer += char;
        if (inSingleQuotedString) {
          inSingleQuotedString = false;
          formattedLines += markToken(mode, 'string', escape(buffer));
          buffer = '';
        } else {
          inSingleQuotedString = true;
        }
      } else if (charCode === 34) {
        // double-quote
        buffer += char;
        if (inDoubleQuotedString) {
          inDoubleQuotedString = false;
          formattedLines += markToken(mode, 'string', escape(buffer));
          buffer = '';
        } else {
          inDoubleQuotedString = true;
        }
      } else if (
        !inSingleQuotedString &&
        !inDoubleQuotedString &&
        wordSeparator.test(char)
      ) {
        if (specialWordRegex.test(buffer)) {
          formattedLines +=
            markToken(
              mode,
              specialWordTypes[specialWords[buffer]],
              escape(buffer)
            ) + escape(char);
          buffer = '';
        } else if (allDigits.test(buffer)) {
          formattedLines +=
            markToken(mode, 'number', escape(buffer)) + escape(char);
          buffer = '';
        } else {
          formattedLines += escape(buffer) + escape(char);
          buffer = '';
        }
      } else {
        buffer += char;
      }
    }

    if (buffer) {
      if (specialWordRegex.test(buffer)) {
        const wordType = specialWords[buffer];
        formattedLines += markToken(
          mode,
          specialWordTypes[wordType],
          escape(buffer)
        );
      } else if (allDigits.test(buffer)) {
        formattedLines += markToken(mode, 'number', escape(buffer));
      } else {
        formattedLines += escape(buffer);
      }
    }
  }

  return formattedLines;
}
