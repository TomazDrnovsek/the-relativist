/**
 * exportBackup.ts — The Relativist
 *
 * Bundles all progress localStorage keys into a single JSON file
 * and triggers a browser download.
 *
 * Device preferences (bauhaus, sound) are included inside
 * relativist_game_state_v5 but the entire key is restored verbatim,
 * so they will be overwritten on import — acceptable for a full backup.
 *
 * Web-only: no Capacitor. Uses <a download> fallback.
 */

const BACKUP_KEYS = [
  'relativist_game_state_v5',
] as const;

export async function exportBackup(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const fileName = `relativist-backup-${today}.json`;

  const payload: Record<string, string> = {
    version: '1',
    exportedAt: new Date().toISOString(),
  };

  BACKUP_KEYS.forEach((key) => {
    const val = localStorage.getItem(key);
    if (val !== null) payload[key] = val;
  });

  const jsonString = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
