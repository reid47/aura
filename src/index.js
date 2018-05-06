import Editor from './components/editor';
import { render, h } from 'preact';

export default function(root, options = {}) {
  root = typeof root === 'string' ? document.querySelector(root) : root;

  if (!root) {
    throw new Error('Failed to initialize: could not find root node.');
  }

  if (!root instanceof Element) {
    throw new Error('Root node must be a valid DOM element.');
  }

  render(<Editor {...options} />, root);

  return {};
}

// function getVisibleLines(textarea) {
//   const computedStyle = getComputedStyle(textarea);

//   const lineHeight =
//     parseFloat(computedStyle.getPropertyValue('line-height')) ||
//     parseFloat(computedStyle.getPropertyValue('font-size')) ||
//     16;

//   const scrollTop = textarea.scrollTop;
//   const visibleHeight = textarea.clientHeight;
//   const firstVisiblePosition = scrollTop - lineHeight;
//   const lastVisiblePosition = scrollTop + visibleHeight + lineHeight;
//   const visibleLines = [];
//   const lines = textarea.value.split(/(\r\n|\r|\n)/);

//   lines.forEach((line, i) => {
//     const linePosition = lineHeight * i;
//     if (
//       linePosition > firstVisiblePosition &&
//       linePosition < lastVisiblePosition
//     ) {
//       visibleLines.push(line);
//     }
//   });

//   return visibleLines;
// }
