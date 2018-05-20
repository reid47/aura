const defaultOptions = {
  /**
   *  Number of extra lines to render above/below visible area
   */
  lineOverscan: 5
};

export default function mergeWithDefaultOptions(givenOptions) {
  return { ...defaultOptions, ...givenOptions };
}
