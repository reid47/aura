import tokenize from './languages/js/tokenize';

onmessage = msg => {
  const tokenized = tokenize(JSON.parse(msg.data));
  postMessage(tokenized);
};
