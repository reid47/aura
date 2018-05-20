import Document from './document';
import Session from './session';
import Renderer from './renderer';

/**
 * Represents a single Aura instance.
 *
 * An `Editor` has an associated `Document`, where its text content
 * is stored, and `Input`, which handles changes to its text content.
 */
export default class Editor {
  constructor(root, options) {
    this.root = root;
    this.options = options;
    this.document = new Document(this.options);
    this.session = new Session(this.root, this.document, this.options);
    this.renderer = new Renderer(this.options);
  }
}
