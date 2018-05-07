export const countLines = text => {
  if (!text) return 0;

  let index = 0;
  let lineCount = 0;
  const length = text.length;

  while (index < length) {
    if (text[index] === '\n') {
      lineCount++;
    }

    index++;
  }

  return lineCount;
};
