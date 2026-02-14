/**
 * Generate a clean style palette based on concept input.
 * Instead of hue-shifting (which looked bad), we pick from
 * a curated set of professional palettes.
 */

const PALETTES = [
  { primary: '#00f2ff', secondary: '#ff00ff', accent: '#39ff14' },   // Cyan / Magenta
  { primary: '#a855f7', secondary: '#ec4899', accent: '#f59e0b' },   // Purple / Pink
  { primary: '#22d3ee', secondary: '#8b5cf6', accent: '#10b981' },   // Teal / Violet
  { primary: '#f43f5e', secondary: '#f97316', accent: '#eab308' },   // Rose / Orange
  { primary: '#3b82f6', secondary: '#06b6d4', accent: '#14b8a6' },   // Blue / Cyan
  { primary: '#84cc16', secondary: '#22c55e', accent: '#10b981' },   // Lime / Green
];

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function generateUniqueStyle(concept) {
  if (!concept || !concept.trim()) {
    return {
      primaryColor: '#00f2ff',
      secondaryColor: '#ff00ff',
      accentColor: '#39ff14',
      glowIntensity: 1,
    };
  }

  const hash = hashCode(concept.trim().toLowerCase());
  const palette = PALETTES[hash % PALETTES.length];

  return {
    primaryColor: palette.primary,
    secondaryColor: palette.secondary,
    accentColor: palette.accent,
    glowIntensity: 1,
  };
}
