// Deterministic color generator for assets
// Maps a key (symbol) or index to a pleasing HSL color.

function hashStringToInt(str: string) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i); /* hash * 33 + c */
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function colorForKey(key?: string, index?: number) {
  // If a key is provided, derive hue from its hash. Otherwise use index.
  const base = key ? hashStringToInt(key) : (index ?? 0);
  const hue = base % 360;

  // Use a pleasant saturation/lightness that contrasts on both light/dark themes.
  const saturation = 68; // %
  const lightness = 52; // %

  return `hsl(${hue} ${saturation}% ${lightness}%)`;
}

export function colorForKeyWithOpacity(key?: string, index?: number, opacity = 0.15) {
  const hsl = colorForKey(key, index);
  // convert 'hsl(h s% l%)' to 'hsl(h s% l% / opacity)'
  return hsl.replace(/\)$/, ` / ${opacity})`).replace('hsl(', 'hsl(');
}

export default colorForKey;
