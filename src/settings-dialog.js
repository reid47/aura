import { el, appendNodes, on } from './util';

const configurableSettings = [
  {
    key: 'fontSize',
    type: 'number',
    label: 'editor font size (px, default: 16)',
    onChange: (editor, newValue) => editor.setFontSize(newValue),
    attrs: { min: '8', max: '72' }
  },
  {
    key: 'lineHeight',
    type: 'number',
    label: 'editor line height (px, default: 24)',
    onChange: (editor, newValue) => editor.setLineHeight(newValue),
    attrs: { min: '8', max: '108' }
  }
];

export default class SettingsDialog {
  static init(els) {
    els.settings = el('div.Aura-settings', {
      hidden: true
    });

    els.settingsDialog = el('div.Aura-settings-dialog', {
      role: 'dialog',
      tabindex: '0',
      'aria-label': 'editor settings'
    });

    els.settingsCloseButton = el('button.Aura-settings-close-button', {
      type: 'button',
      'aria-label': 'close'
    });

    els.settingsCloseButton.innerHTML = '&times;';

    els.settingsInputs = configurableSettings.map(setting => {
      const label = el('label.Aura-settings-input-label');
      label.innerText = setting.label;

      const input = el('input.Aura-settings-input', {
        type: setting.type,
        ...setting.attrs
      });

      return appendNodes(label, input);
    });

    return appendNodes(
      els.settings,
      appendNodes(
        els.settingsDialog,
        ...els.settingsInputs,
        els.settingsCloseButton
      )
    );
  }

  constructor(els, editor, options) {
    this.els = els;
    this.editor = editor;
    this.options = options;

    on(this.els.settingsCloseButton, 'click', this.close);
    this.els.settingsInputs.forEach((el, i) => {
      on(el, 'change', evt =>
        configurableSettings[i].onChange(this.editor, evt.target.value)
      );
    });
  }

  isOpen = () => {
    return !this.els.settings.hidden;
  };

  open = () => {
    this.els.settings.hidden = false;
    this.els.settingsDialog.focus();
    this.editor.disableTextArea();
  };

  close = () => {
    this.els.settings.hidden = true;
    this.editor.enableTextArea();
    this.editor.focusTextArea();
  };

  toggle = () => {
    if (this.els.settings.hidden) this.open();
    else this.close();
  };
}
