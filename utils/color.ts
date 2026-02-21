import { HSL } from '../types';

export const FIXED_CENTER_COLOR: HSL = { h: 0, s: 0, l: 50 };

export const hslToString = (color: HSL): string => {
  return `hsl(${color.h.toFixed(1)}, ${color.s.toFixed(1)}%, ${color.l.toFixed(1)}%)`;
};

// Convert HSL to Hex for display
export const hslToHex = (h: number, s: number, l: number): string => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    const hex = Math.round(255 * color).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
};

export const hslToRgb = (h: number, s: number, l: number): { r: number, g: number, b: number } => {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return {
    r: Math.round(255 * f(0)),
    g: Math.round(255 * f(8)),
    b: Math.round(255 * f(4))
  };
};

export const getPerceivedBrightness = (color: HSL): number => {
    const { r, g, b } = hslToRgb(color.h, color.s, color.l);
    // HSP equation for brightness
    return Math.sqrt(
      0.299 * (r * r) +
      0.587 * (g * g) +
      0.114 * (b * b)
    );
};

// Calculate Redmean color difference (approximation of Delta E)
// Returns a value roughly between 0 and 765
export const calculateRedMeanDiff = (c1: HSL, c2: HSL): number => {
  const rgb1 = hslToRgb(c1.h, c1.s, c1.l);
  const rgb2 = hslToRgb(c2.h, c2.s, c2.l);

  const rBar = (rgb1.r + rgb2.r) / 2;
  const deltaR = rgb1.r - rgb2.r;
  const deltaG = rgb1.g - rgb2.g;
  const deltaB = rgb1.b - rgb2.b;

  return Math.sqrt(
    (2 + rBar / 256) * (deltaR * deltaR) +
    4 * (deltaG * deltaG) +
    (2 + (255 - rBar) / 256) * (deltaB * deltaB)
  );
};

export const calculateMatchScore = (target: HSL, guess: HSL): number => {
  const diff = calculateRedMeanDiff(target, guess);
  // Empirically, a diff of < 15 is excellent. > 200 is poor.
  // We map 0-100 score. 0 diff = 100 score.
  // 150 diff = 0 score.
  const maxDiff = 150;
  const score = Math.max(0, 100 - (diff / maxDiff) * 100);
  return Math.round(score);
};

export const generateRandomColor = (): HSL => {
  return {
    h: Math.floor(Math.random() * 360),
    s: 20 + Math.floor(Math.random() * 80), // Avoid too grey
    l: 20 + Math.floor(Math.random() * 60), // Avoid too dark/light
  };
};