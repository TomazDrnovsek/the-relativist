/**
 * importBackup.ts — The Relativist
 *
 * Reads a .json backup file produced by exportBackup, validates it,
 * writes known keys back to localStorage, and reloads the app.
 *
 * Device preferences are intentionally restored as part of the state blob.
 */

const RESTORABLE_KEYS = [
  'relativist_game_state_v5',
] as const;

export async function importBackup(file: File): Promise<void> {
  const text = await file.text();

  let parsed: Record<string, string>;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error('Invalid backup file: could not parse JSON.');
  }

  if (!parsed.version) {
    throw new Error('Invalid backup file: missing version field.');
  }

  let restored = 0;
  RESTORABLE_KEYS.forEach((key) => {
    if (parsed[key] !== undefined) {
      localStorage.setItem(key, parsed[key]);
      restored++;
    }
  });

  if (restored === 0) {
    throw new Error('Backup file contains no recognisable data.');
  }

  window.location.reload();
}
