import { el, on, appendNodes, debounce } from './util';
import SettingsDialog from './settings-dialog';

export default function constructDom(root, options, els) {
  els.wrapper = el('div.Aura-editor');
  els.codeWrapper = el('div.Aura-code-wrapper');
  els.textareaWrapper = el('div.Aura-textarea-wrapper');
  els.toolbar = el('div.Aura-toolbar', { role: 'toolbar' });

  els.syntaxHighlightOverlay = el('div.Aura-highlight-overlay', {
    role: 'presentation'
  });

  els.cursorOverlay = el('div.Aura-cursor-overlay', {
    role: 'presentation'
  });

  els.cursor = el('div.Aura-cursor', {
    role: 'presentation'
  });

  els.lineNumbers = el('div.Aura-line-numbers', {
    role: 'presentation'
  });

  els.textarea = el('textarea.Aura-textarea', {
    autocomplete: 'false',
    autocorrect: 'false',
    autocapitalize: 'false',
    spellCheck: 'false',
    'aria-label': options.editorAreaLabel || 'code editor'
  });

  const settingsEl = SettingsDialog.init(els);

  appendNodes(
    root,
    appendNodes(
      els.wrapper,
      els.toolbar,
      appendNodes(
        els.codeWrapper,
        els.lineNumbers,
        appendNodes(
          els.textareaWrapper,
          appendNodes(els.cursorOverlay, els.cursor),
          els.syntaxHighlightOverlay,
          els.textarea
        )
      ),
      settingsEl
    )
  );
}
