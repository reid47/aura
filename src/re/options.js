const defaultOptions = {
  /**
   * Editor font size
   */
  fontSize: 16,

  /**
   * Editor line height
   */
  lineHeight: 24,

  /**
   *  Number of extra lines to render above/below visible area
   */
  lineOverscan: 5
};

export default function mergeWithDefaultOptions(givenOptions) {
  return { ...defaultOptions, ...givenOptions };
}
