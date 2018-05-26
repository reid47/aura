import Document from './document';
import { on } from './dom';
import mergeWithDefaultOptions from './options';
import Renderer from './renderer';
import Session from './session';

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
    this.document = new Document(this.root, this.options);
    this.session = new Session(this.root, this.document, this.options);
    this.renderer = new Renderer(this.root, this.document, this.session, this.options);

    this.renderer.mount();
    on(this.root, 'lineTextChange', this.onLineTextChange);
    on(this.root, 'selectionChange', this.onSelectionChange);
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
