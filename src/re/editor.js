import Document from './document';
import Session from './session';
import Renderer from './renderer';
import mergeWithDefaultOptions from './options';

/**
 * Represents a single Aura instance.
 *
 * An `Editor` has an associated `Document`, where its text content
 * is stored, a `Session`, which keeps track of the editor state, and
 * a `Renderer`, which draws visible lines to the screen.
 */
export default class Editor {
  constructor(root, options) {
    this.root = root;
    this.options = mergeWithDefaultOptions(options);
    this.document = new Document(this.options);
    this.session = new Session(this.root, this.document, this.options);
    this.renderer = new Renderer(
      this.root,
      this.document,
      this.session,
      this.options
    );

    this.renderer.mount();
    this.root.addEventListener('lineTextChange', this.onLineTextChange);
    this.root.addEventListener('selectionChange', this.onSelectionChange);
  }

  onLineTextChange = () => {
    this.renderer.scrollIntoView(this.session.selection);
    this.renderer.render();
  };

  onSelectionChange = () => {
    this.session.input.focus();
    this.renderer.scrollIntoView(this.session.selection);
    this.renderer.render();
  };
}
