export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export interface SavedSwatch {
  id: number;
  color: HSL;
  timestamp: number;
}

export type BauhausShapeType = 
  | 'square' 
  | 'trapezoid' 
  | 'triangle' 
  | 'l-beam' 
  | 'semi-circle' 
  | 'circle' 
  | 'capsule' 
  | 'rhombus' 
  | 'cross';

export interface StripData {
  id: number;
  backgroundColor: HSL;
  chipColor: HSL;
}

export interface SessionData {
  id: number;           // Sequential ID (1, 2, 3...)
  name: string;         // Generated Name (e.g., "SILENT VOID")
  rootHue: number;      // The base hue (0-360)
  mood: string;         // 'VIVID' | 'DARK' | 'PALE'
  palette: HSL[];       // The 16 target colors
  playOrder: number[];  // Array of shuffled indices (0-15) for non-linear gameplay
  progress: (number | null)[]; // Scores for each level (null = unplayed)
  isComplete: boolean;
}

export interface SavedDeck {
  availableHues: number[]; // Array of hue buckets to cycle through
  cycleCount: number;      // How many times we've cycled the deck
}

export interface GameState {
  collection: SessionData[];
  level: number;
  sessionCount: number;
  currentSession: SessionData | null;
  settings: {
    isBauhausMode: boolean;
    isSoundEnabled: boolean;
  };
  hasCompletedOnboarding: boolean;
}
