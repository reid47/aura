// import Editor from './components/editor';
import Editor from './take2/editor2';
// import { render, h } from 'preact';

export default function(root, options = {}) {
  root = typeof root === 'string' ? document.querySelector(root) : root;

  if (!root) {
    throw new Error('Failed to initialize: could not find root node.');
  }

  if (!root instanceof Element) {
    throw new Error('Root node must be a valid DOM element.');
  }

  // render(<Editor {...options} />, root);

  return new Editor(root, options);
}
