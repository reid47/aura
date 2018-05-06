const createElement = (type, className, attrs = {}) => {
  const el = document.createElement(type);

  el.className = className;

  Object.entries(attrs).forEach(([attr, val]) => {
    el.setAttribute(attr, val);
  });

  return el;
};

const textNode = text => document.createTextNode(text);

export default function(root, options) {
  const wrapper = createElement('div', 'Ideally-wrapper');

  let toolbar;
  if (!options.hideToolbar) {
    toolbar = createElement('div', 'Ideally-toolbar', {
      role: 'toolbar'
    });

    const button = createElement('button', 'Ideally-button');
    button.appendChild(textNode('hello'));

    toolbar.appendChild(button);
    wrapper.appendChild(toolbar);
  }

  const textarea = createElement('textarea', 'Ideally-textarea', {
    autocomplete: 'false',
    autocorrect: 'false',
    autocapitalize: 'false',
    spellcheck: 'false'
  });

  wrapper.appendChild(textarea);
  root.appendChild(wrapper);

  return { wrapper, toolbar, textarea };
}
