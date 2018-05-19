import Document from '../src/document';
import { initCustomEvents } from '../src/custom-events';
const mockRoot = { dispatchEvent: jest.fn() };

describe('Document', () => {
  beforeEach(() => {
    initCustomEvents(mockRoot);
  });

  test('created without options', () => {
    const doc = new Document();
    expect(doc.getText()).toEqual('');
    expect(doc.getLines()).toEqual(['']);
    expect(doc.getCursorPosition()).toEqual({
      cursorLine: 0,
      cursorColumn: 0
    });
  });

  test('created with initial value', () => {
    const doc = new Document({ initialValue: 'hello\nworld!' });
    expect(doc.getText()).toEqual('hello\nworld!');
    expect(doc.getLines()).toEqual(['hello', 'world!']);
    expect(doc.getCursorPosition()).toEqual({
      cursorLine: 0,
      cursorColumn: 0
    });
  });

  describe('updateLineAtCursor', () => {
    test('updating an empty line with cursor at line start', () => {
      const doc = new Document();
      doc.updateLineAtCursor('hello!', 6);
      expect(doc.getText()).toBe('hello!');
      expect(doc.cursorLine).toBe(0);
      expect(doc.cursorColumn).toBe(6);
      expect(doc.lastSavedCursorColumn).toBe(6);
    });

    test('updating a line with cursor in middle of line', () => {
      const doc = new Document({ initialValue: 'hello!' });
      doc.cursorColumn = doc.lastSavedCursorColumn = 3;
      doc.updateLineAtCursor('world!', 6);
      expect(doc.getText()).toBe('world!');
      expect(doc.cursorLine).toBe(0);
      expect(doc.cursorColumn).toBe(6);
      expect(doc.lastSavedCursorColumn).toBe(6);
    });
  });
});
