/**
 * exportBackup.ts — The Relativist
 *
 * Bundles all progress localStorage keys into a single JSON file.
 *
 * On Capacitor (iOS / Android):
 *   1. Serialize keys to JSON string
 *   2. Filesystem.writeFile → real file:// URI in Cache dir
 *   3. Share.share({ files: [uri] }) → native share sheet
 *
 * On web (dev / browser):
 *   Falls back to <a download> trigger.
 */

const isCapacitor = (): boolean =>
  typeof (window as any).Capacitor !== 'undefined' &&
  (window as any).Capacitor.isNativePlatform?.();

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

  // ── Native path (Capacitor) ────────────────────────────────────────
  if (isCapacitor()) {
    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');

    const writeResult = await Filesystem.writeFile({
      path: fileName,
      data: jsonString,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });

    await Share.share({
      title: 'The Relativist — Backup',
      text: `Progress backup exported on ${today}`,
      files: [writeResult.uri],
      dialogTitle: 'Save Backup',
    });

    return;
  }

  // ── Web fallback ───────────────────────────────────────────────────
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
