const wordSeparator = /^[ \t\n\r.,-:;\(\)\[\]$&\{\}]/;
const allWhitespace = /^\s*$/;
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
  const replaced = text.replace(/[&<>"'`=\/]/g, c => htmlEntities[c]);
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
  const marked = `<span class="Aura-token ${mode} ${type}">${escape(
    text
  )}</span>`;
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

const specialWordTypes = {
  1: 'keyword',
  2: 'boolean',
  3: 'operator'
};

const symbols = {};

export default function tokenize(
  lines,
  { firstVisibleLine, lastVisibleLine, cursorIndex }
) {
  console.time('tokenize2');
  const mode = 'js'; // TODO: make this configurable
  const length = lines.length;
  let formattedLines = '';

  let buffer = '';
  let cursorLine;
  let charsProcessed = 0;

  for (let lineIndex = 0; lineIndex < length; lineIndex++) {
    const isVisible =
      lineIndex >= firstVisibleLine && lineIndex <= lastVisibleLine;

    if (!isVisible) continue;

    const line = lines[lineIndex];
    const lineLength = line.length;
    charsProcessed += lineLength + 1;

    if (cursorLine == null && charsProcessed > cursorIndex) {
      cursorLine = lineIndex;
      console.log({ cursorLine });
    }

    if (allWhitespace.test(line)) {
      formattedLines += '\n&nbsp;';
      continue;
    }

    formattedLines += '\n';
    buffer = '';

    for (let column = 0; column < lineLength; column++) {
      const char = line[column];

      if (wordSeparator.test(char)) {
        const wordType = specialWords[buffer];

        if (wordType) {
          if (isVisible) {
            formattedLines +=
              markToken(mode, specialWordTypes[wordType], buffer) +
              escape(char);
          }

          buffer = '';
        } else if (allDigits.test(buffer)) {
          if (isVisible) {
            formattedLines += markToken(mode, 'number', buffer) + escape(char);
          }

          buffer = '';
        } else {
          if (isVisible) {
            formattedLines += buffer + escape(char);
          }

          buffer = '';
        }
      } else {
        buffer += escape(char);
      }
    }

    if (isVisible && buffer) {
      formattedLines += buffer;
    }
  }

  console.timeEnd('tokenize2');
  // console.log(formattedLines);
  return { formattedLines, cursorLine };
}
