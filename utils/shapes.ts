import { BauhausShapeType } from '../types';

export const getBauhausShape = (hue: number): BauhausShapeType => {
  // Normalize hue to 0-360
  const h = (hue % 360 + 360) % 360;
  
  // Strict Mapping (Stricter Yellow/Green separation)
  if (h >= 341 || h <= 25) return 'square';     // 341-25 (Red)
  if (h <= 49) return 'trapezoid';              // 26-49 (Orange)
  if (h <= 70) return 'triangle';               // 50-70 (Pure Yellow) - Ends earlier to avoid Green bleed
  if (h <= 100) return 'rhombus';               // 71-100 (Lime) - Starts earlier
  if (h <= 160) return 'l-beam';                // 101-160 (Green) - Starts earlier
  if (h <= 200) return 'semi-circle';           // 161-200 (Cyan)
  if (h <= 260) return 'circle';                // 201-260 (Blue)
  if (h <= 300) return 'capsule';               // 261-300 (Purple)
  if (h <= 340) return 'cross';                 // 301-340 (Magenta)
  
  return 'square'; // Fallback
};