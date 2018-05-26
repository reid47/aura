import Editor from './editor';

export default function(root, options = {}) {
  root = typeof root === 'string' ? document.querySelector(root) : root;

  if (!root) {
    throw new Error('Aura: failed to initialize: could not find root node.');
  }

  if (!(root instanceof Element && root.tagName === 'TEXTAREA')) {
    throw new Error('Aura: root element must be a valid textarea in the DOM.');
  }

  return new Editor(root, options);
}
