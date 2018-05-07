const wordSeparator = /^[ \t\n\r.,\(\)\[\]$&\{\}]/;
const allWhitespace = /^\s*$/;

const span = (type, text) => `<span class="Aura-token ${type}">${text}</span>`;

const keywords = {
  const: 1,
  let: 1,
  var: 1,
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
  continue: 1
};

export default function tokenize(lines) {
  const length = lines.length;
  const formattedLines = Array(length);

  let buffer = '';

  for (let lineIndex = 0; lineIndex < length; lineIndex++) {
    const line = lines[lineIndex];
    const lineLength = line.length;

    if (allWhitespace.test(line)) {
      formattedLines[lineIndex] = line;
      continue;
    }

    formattedLines[lineIndex] = '';

    buffer = '';

    for (let column = 0; column < lineLength; column++) {
      const char = line[column];

      if (wordSeparator.test(char)) {
        if (keywords[buffer]) {
          formattedLines[lineIndex] += span('keyword', buffer) + char;
          buffer = '';
        } else {
          formattedLines[lineIndex] += buffer + char;
          buffer = '';
        }
      } else {
        buffer += char;
      }
    }

    if (buffer) {
      formattedLines[lineIndex] += buffer;
    }
  }

  // console.log(formattedLines);

  return formattedLines;
  // let { index = 0, line = 0, column = 0, tokens = [] } = state;
  // const length = code.length;
  // while (index < length) {
  //   if (code.indexOf('const', index) === index) {
  //     index += 5;
  //     tokens.push({
  //       kind: 'keyword',
  //       lineStart: line + 1,
  //       lineEnd: line + 1,
  //       columnStart: column + 1,
  //       columnEnd: column + 1
  //     });
  //   } else {
  //     if (code[index] === '\n') {
  //       line++;
  //       column = 0;
  //     } else {
  //       column++;
  //     }
  //     index++;
  //   }
  // }
  // return { index, line, column, tokens };
}
