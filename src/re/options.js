const defaultOptions = {
  /**
   * Editor font family
   * Can be any CSS font value (e.g. "Consolas, 'Courier New', monospace")
   */
  fontFamily: 'monospace',

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
  lineOverscan: 5,

  /**
   * Character to use to join lines, e.g. when calling `document.getValue()`
   */
  lineSeparator: '\n'
};

export default function mergeWithDefaultOptions(givenOptions) {
  return { ...defaultOptions, ...givenOptions };
}
