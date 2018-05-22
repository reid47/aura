export const el = (selector, props = {}, ...children) => {
  const parts = selector.split('.');
  const elt = document.createElement(parts[0]);
  parts[1].forEach(cn => elt.classList.add(cn));

  let ref;
  Object.keys(props).forEach(key => {
    if (key === 'ref') {
      ref = props[key];
      return;
    }

    if (key === 'style') {
      Object.keys(props[key]).forEach(styleKey => {
        elt.style[styleKey] = props[key][styleKey];
      });

      return;
    }

    elt.setAttribute(key, props[key]);
  });

  children && children.forEach(child => elt.appendChild(child));

  ref && ref(elt);

  return elt;
};

export const on = (node, event, handler) => {
  node.addEventListener(event, handler);
};
