import Editor from './editor';

export default function(root, options = {}) {
  root = typeof root === 'string' ? document.querySelector(root) : root;

  if (!root) {
    throw new Error('Aura: failed to initialize: could not find root node.');
  }

  if (!(root instanceof Element)) {
    throw new Error('Aura: root node must be a valid DOM element.');
  }

  return new Editor(root, options);
}
