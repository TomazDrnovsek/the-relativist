import { HSL, SessionData, SavedDeck } from '../types';

// --- Constants & Lookups ---

// Nouns mapped to Hue buckets (12 buckets of 30 degrees)
// Indices correspond to Math.floor(hue / 30)
const HUE_NOUNS: string[][] = [
  ['CLAY', 'MARS', 'HEAT', 'PULSE', 'SIGNAL'],      // 0-30 (Red)
  ['RUST', 'AMBER', 'FLUX', 'CANYON'],              // 30-60 (Orange)
  ['RAY', 'SULFUR', 'GOLD', 'ION'],                 // 60-90 (Yellow)
  ['MOSS', 'JADE', 'ECHO', 'RESIN'],                // 90-120 (Lime/Green)
  ['FERN', 'ALGAE', 'VINE', 'STEM'],                // 120-150 (Green)
  ['MINT', 'AQUA', 'FLOW', 'SPRING'],               // 150-180 (Spring/Teal)
  ['GLASS', 'FROST', 'ZERO', 'ICE'],                // 180-210 (Cyan)
  ['VOID', 'DEPTH', 'OCEAN', 'INK'],                // 210-240 (Blue)
  ['INDIGO', 'NIGHT', 'ARC', 'WAVE'],               // 240-270 (Indigo)
  ['HAZE', 'NEON', 'AURA', 'PHASE'],                // 270-300 (Purple)
  ['BLUSH', 'SILK', 'CORAL', 'QUARTZ'],             // 300-330 (Pink/Magenta)
  ['ROSE', 'VELVET', 'BLOOM', 'PULSE']              // 330-360 (Rose/Red)
];

const ADJECTIVES = {
  DARK: ['DEEP', 'SILENT', 'MIDNIGHT', 'HIDDEN'],     // L < 30
  PALE: ['SOFT', 'DUSTY', 'BLEACHED', 'PAPER'],       // S < 30
  VIVID: ['HYPER', 'KINETIC', 'ELECTRIC', 'RADICAL'], // S > 70
  NEUTRAL: ['STATIC', 'PRIME', 'CORE', 'RAW']         // Default
};

// --- Helper Functions ---

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
const wrapHue = (h: number) => (h % 360 + 360) % 360;

const getRandomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// Fisher-Yates Shuffle (Generic)
const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// --- Generators ---

export const generateSessionName = (h: number, avgS: number, avgL: number): { name: string, mood: string } => {
  // Determine Noun based on Hue
  const hueIndex = Math.floor(wrapHue(h) / 30);
  const nounList = HUE_NOUNS[hueIndex] || HUE_NOUNS[0];
  const noun = getRandomItem(nounList);

  // Determine Adjective (Mood) based on Avg Sat/Lum
  let mood = 'NEUTRAL';
  let adjective = '';

  if (avgL < 30) {
    mood = 'DARK';
    adjective = getRandomItem(ADJECTIVES.DARK);
  } else if (avgS < 30) {
    mood = 'PALE';
    adjective = getRandomItem(ADJECTIVES.PALE);
  } else if (avgS > 70) {
    mood = 'VIVID';
    adjective = getRandomItem(ADJECTIVES.VIVID);
  } else {
    mood = 'NEUTRAL';
    adjective = getRandomItem(ADJECTIVES.NEUTRAL);
  }

  return {
    name: `${adjective} ${noun}`,
    mood
  };
};

export const generateSessionPalette = (rootHue: number): HSL[] => {
  const palette: HSL[] = [];

  // Helper to wrap hue
  const w = (h: number) => (h % 360 + 360) % 360;

  // Row 1: HERO (Material: Plastic/Vivid)
  // Base Hue. High Saturation (85%). Mid Lightness (50%).
  // Progression: Shift Hue (+8 deg per step) - Was 15
  for (let i = 0; i < 4; i++) {
    palette.push({
      h: w(rootHue + (i * 8)),
      s: 85,
      l: 50
    });
  }

  // Row 2: SHADOW (Material: Rubber/Matte)
  // Base Hue. Moderate Saturation (40%). Low Lightness.
  // Progression: Shift Lightness (+6% per step starting at 10%) - Was 8
  for (let i = 0; i < 4; i++) {
    palette.push({
      h: w(rootHue), // Keep hue stable for shadows
      s: 40,
      l: 10 + (i * 6)
    });
  }

  // Row 3: WASH (Material: Paper/Pastel)
  // Base Hue. High Lightness (90%).
  // Progression: Shift Saturation (+15% per step starting at 10%) - Was 20
  for (let i = 0; i < 4; i++) {
    palette.push({
      h: w(rootHue),
      s: 10 + (i * 15),
      l: 90
    });
  }

  // Row 4: ACCENT (Material: Metal/Neon)
  // Complementary Hue (Root + 180). High Saturation (90%). Mid-High Lightness (55%).
  // Progression: Shift Hue back towards root (-15 deg per step) - Was 20
  const compHue = rootHue + 180;
  for (let i = 0; i < 4; i++) {
    palette.push({
      h: w(compHue - (i * 15)),
      s: 90,
      l: 55
    });
  }

  return palette;
};

export const getNextSession = (currentId: number): SessionData => {
  // 1. Deck Logic
  const deckKey = 'relativist_deck';
  let deck: SavedDeck;
  
  try {
    const savedDeck = localStorage.getItem(deckKey);
    deck = savedDeck ? JSON.parse(savedDeck) : { availableHues: [], cycleCount: 0 };
  } catch (e) {
    deck = { availableHues: [], cycleCount: 0 };
  }

  // Initialize or Reset Deck if empty
  if (!deck.availableHues || deck.availableHues.length === 0) {
    // Create 12 buckets: 0, 30, 60 ... 330
    const buckets = Array.from({ length: 12 }, (_, i) => i * 30);
    deck.availableHues = shuffleArray(buckets);
    deck.cycleCount += 1;
  }

  // Pop hue
  const hue = deck.availableHues.pop()!; // Non-null asserted because we just filled it if empty
  localStorage.setItem(deckKey, JSON.stringify(deck));

  // 2. Generate Palette
  // Add small variance to the root hue so sessions in the same bucket aren't identical across cycles
  const rootHue = wrapHue(hue + (Math.random() * 20 - 10));
  const palette = generateSessionPalette(rootHue);

  // 3. Generate Name
  // Calculate averages for naming
  const avgS = palette.reduce((sum, c) => sum + c.s, 0) / palette.length;
  const avgL = palette.reduce((sum, c) => sum + c.l, 0) / palette.length;
  
  const { name, mood } = generateSessionName(rootHue, avgS, avgL);

  // 4. Generate Play Order (The Shuffle)
  // Create an array [0, 1, ... 15] and shuffle it
  const indices = Array.from({ length: 16 }, (_, i) => i);
  const playOrder = shuffleArray(indices);

  // 5. Construct Session
  return {
    id: currentId,
    name,
    rootHue,
    mood,
    palette,
    playOrder,
    progress: Array(16).fill(null),
    isComplete: false
  };
};