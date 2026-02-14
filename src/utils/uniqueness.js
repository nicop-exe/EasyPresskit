/**
 * Generates a deterministic hash from a string
 */
const hashString = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Returns a unique style object based on user input
 */
export const generateUniqueStyle = (input) => {
  if (!input) return {
    primaryColor: '#00f2ff',
    secondaryColor: '#ff00ff',
    glowIntensity: 1,
    fontVariant: 'Rajdhani'
  };

  const hash = hashString(input);
  
  // Deterministic colors based on hash
  const hues = [
    (hash % 360), // Primary Hue
    ((hash + 120) % 360) // Secondary Hue (Triadic-ish)
  ];

  return {
    primaryColor: `hsl(${hues[0]}, 100%, 50%)`,
    secondaryColor: `hsl(${hues[1]}, 100%, 50%)`,
    glowIntensity: (hash % 10) / 5 + 0.5, // 0.5 to 2.5
    fontVariant: hash % 2 === 0 ? 'Orbitron' : 'Rajdhani'
  };
};
