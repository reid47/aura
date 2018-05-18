import { el } from '../dom';

export default class Cursor {
  init = () => {
    return el('div.Aura-cursor', {
      role: 'presentation'
    });
  };
}
