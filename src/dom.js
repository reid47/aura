export const el = (selector, props = {}, children) => {
  const [type, ...classNames] = selector.split('.');
  const elt = document.createElement(type);
  classNames.forEach(cn => elt.classList.add(cn));

  let ref;
  Object.keys(props).forEach(key => {
    if (key === 'ref') {
      ref = props[key];
      return;
    }

    if (key === 'on') {
      Object.keys(props[key]).forEach(eventKey => {
        elt.addEventListener(eventKey, props[key][eventKey]);
      });

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
