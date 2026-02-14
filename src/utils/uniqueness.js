/**
 * Fixed style — no hue shifting at all.
 * Always returns the same red accent palette.
 */
export function generateUniqueStyle() {
  return {
    primaryColor: '#ff1744',
    secondaryColor: '#ff1744',
    accentColor: '#ff1744',
  };
}
