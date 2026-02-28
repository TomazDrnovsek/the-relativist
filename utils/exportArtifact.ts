/**
 * exportArtifact.ts — The Relativist
 *
 * Draws the session artifact card to an offscreen canvas (2D API, no CSS
 * parsing, no oklch errors), then exports via the appropriate path:
 *
 * On Capacitor (iOS / Android):
 *   1. canvas.toDataURL → base64
 *   2. Filesystem.writeFile → real file:// URI in Cache dir
 *   3. Share.share({ files: [uri] }) → native share sheet
 *
 * On web (dev / browser):
 *   base64 → Blob → navigator.share with File objects → <a download> fallback
 *
 * WHY NOT navigator.share with File objects on Capacitor:
 *   navigator.canShare({ files }) returns false in Capacitor WebView for
 *   in-memory blob-backed File objects. The WebView has no access to a
 *   file:// URI for the blob, so the OS share intent never fires.
 *   The @capacitor/share plugin bypasses this by invoking the native
 *   Android/iOS share API directly with a real cache-directory URI.
 */

import { SessionData } from '../types';

const isCapacitor = (): boolean =>
  typeof (window as any).Capacitor !== 'undefined' &&
  (window as any).Capacitor.isNativePlatform?.();

export interface ExportOptions {
  session: SessionData;
  resonance: number;
  pixelRatio?: number;
}

function drawCard(
  ctx: CanvasRenderingContext2D,
  session: SessionData,
  resonance: number,
  W: number
): number {
  const PAD = 8;
  const GAP = 2;
  const COLS = 4;
  const cellW = (W - PAD * 2 - GAP * (COLS - 1)) / COLS;
  const gridH = cellW * 4 + GAP * 3;
  const TITLE_H = 28;
  const DIVIDER_Y = TITLE_H + PAD + gridH + PAD;
  const META_H = 60;
  const H = DIVIDER_Y + 1 + META_H;

  // ── Card background ──────────────────────────────────────────────
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Card border
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, W - 1, H - 1);

  // ── "the relativist." title ──────────────────────────────────────
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.fillStyle = '#121212';
  ctx.font = '900 13px Jost, system-ui, sans-serif';
  ctx.letterSpacing = '-0.05em';
  ctx.fillText('the relativist.', PAD + 8, TITLE_H / 2);
  ctx.letterSpacing = '0em';

  // ── 4 × 4 swatch grid ───────────────────────────────────────────
  session.palette.forEach((color, idx) => {
    const col = idx % COLS;
    const row = Math.floor(idx / COLS);
    const x = PAD + col * (cellW + GAP);
    const y = TITLE_H + PAD + row * (cellW + GAP);

    if (session.progress[idx] !== null) {
      ctx.fillStyle = `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
      ctx.fillRect(x, y, cellW, cellW);
    } else {
      ctx.fillStyle = '#f9fafb';
      ctx.fillRect(x, y, cellW, cellW);
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x + 0.25, y + 0.25, cellW - 0.5, cellW - 0.5);
    }
  });

  // ── Divider ──────────────────────────────────────────────────────
  ctx.strokeStyle = '#e8e5de';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(PAD * 2, DIVIDER_Y);
  ctx.lineTo(W - PAD * 2, DIVIDER_Y);
  ctx.stroke();

  // ── Metadata strip ───────────────────────────────────────────────
  const metaTop = DIVIDER_Y + 1;
  const textPad = 16;
  const labelY = metaTop + 12;
  const valueY = metaTop + 24;

  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';

  // Left: RESONANCE
  ctx.fillStyle = '#9ca3af';
  ctx.font = '700 8px/1 monospace';
  ctx.fillText('RESONANCE', textPad, labelY);

  ctx.fillStyle = '#121212';
  ctx.font = '900 22px/1 system-ui, sans-serif';
  ctx.fillText(`${resonance}%`, textPad, valueY);

  // Right: SESSION
  ctx.textAlign = 'right';

  ctx.fillStyle = '#9ca3af';
  ctx.font = '700 8px/1 monospace';
  ctx.fillText('SESSION', W - textPad, labelY);

  ctx.fillStyle = '#121212';
  ctx.font = '900 22px/1 system-ui, sans-serif';
  ctx.fillText(session.id.toString().padStart(2, '0'), W - textPad, valueY);

  return H;
}

export async function exportArtifact({
  session,
  resonance,
  pixelRatio = 3,
}: ExportOptions): Promise<void> {
  const W = 280;
  const fileName = `relativist-session-${session.id.toString().padStart(2, '0')}.png`;

  // Ensure Jost 900 is available to the canvas context
  await document.fonts.load('900 13px Jost');

  // ── 1. Draw to offscreen canvas ─────────────────────────────────
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  // Measure height at scale 1, then redraw at full pixel ratio
  canvas.width = W;
  canvas.height = 1;
  const H = drawCard(ctx, session, resonance, W);

  canvas.width = W * pixelRatio;
  canvas.height = H * pixelRatio;
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  drawCard(ctx, session, resonance, W);

  // ── 2. Canvas → base64 dataURL ──────────────────────────────────
  const dataUrl = canvas.toDataURL('image/png');
  const base64Data = dataUrl.split(',')[1];

  // ── 3. Native path (Capacitor) ──────────────────────────────────
  if (isCapacitor()) {
    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    const { Share } = await import('@capacitor/share');

    const writeResult = await Filesystem.writeFile({
      path: fileName,
      data: base64Data,
      directory: Directory.Cache,
    });

    await Share.share({
      title: 'The Relativist',
      text: `Session ${session.id.toString().padStart(2, '0')} · ${resonance}% Resonance`,
      files: [writeResult.uri],
      dialogTitle: 'Export Artifact',
    });

    return;
  }

  // ── 4. Web fallback ─────────────────────────────────────────────
  const binary = atob(base64Data);
  const arr = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
  const blob = new Blob([arr], { type: 'image/png' });

  const file = new File([blob], fileName, { type: 'image/png' });
  if (
    navigator.share &&
    navigator.canShare &&
    navigator.canShare({ files: [file] })
  ) {
    await navigator.share({
      title: 'The Relativist',
      text: `Session ${session.id.toString().padStart(2, '0')} · ${resonance}% Resonance`,
      files: [file],
    });
    return;
  }

  // Last resort: <a download>
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
