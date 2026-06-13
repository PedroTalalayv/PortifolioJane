/**
 * Comprime os vídeos pesados (>40MB) de public/uploads/motion/ pra caber no
 * limite free do Supabase (50MB/arquivo).
 *
 * Recipe: H.264 720p, CRF 22, preset slow, AAC 128k, faststart.
 * Visualmente impecável pra web. Arquivos de 200MB caem pra 8-15MB.
 *
 * Roda: node scripts/compress-videos.mjs
 * (não precisa de env — usa ffmpeg embarcado via ffmpeg-static)
 */
import { readdir, stat, rename, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';

const DIR = './public/uploads/motion';
const THRESHOLD_MB = 40;  // arquivos abaixo disso já estão OK, não toca

const fmt = (b) => `${(b / 1024 / 1024).toFixed(1)} MB`;

function compress(input, output) {
  return new Promise((resolve, reject) => {
    const args = [
      '-i', input,
      '-c:v', 'libx264',
      '-preset', 'slow',
      '-crf', '22',
      '-vf', 'scale=-2:720',          // 720p de altura, largura preserva aspect
      '-pix_fmt', 'yuv420p',          // compatibilidade max com browsers
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',      // metadata na frente — start playing antes de baixar tudo
      '-loglevel', 'error',           // silencia spam de ffmpeg (só erros aparecem)
      '-stats',                       // mas mostra progresso (frame, time, speed)
      '-y',
      output,
    ];
    const proc = spawn(ffmpegPath, args, { stdio: ['ignore', 'inherit', 'inherit'] });
    proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg exit ${code}`))));
    proc.on('error', reject);
  });
}

const files = (await readdir(DIR)).filter((f) => f.endsWith('.mp4'));
const targets = [];

for (const file of files) {
  const path = join(DIR, file);
  const { size } = await stat(path);
  if (size > THRESHOLD_MB * 1024 * 1024) {
    targets.push({ file, path, size });
  }
}

if (!targets.length) {
  console.log('✅ nenhum arquivo precisa de compressão.');
  process.exit(0);
}

console.log(`🎬 ${targets.length} vídeos pra comprimir (>${THRESHOLD_MB}MB)`);
console.log(`📐 720p · H.264 CRF 22 · slow preset · AAC 128k\n`);

const startedAll = Date.now();
const results = [];

for (let i = 0; i < targets.length; i++) {
  const { file, path, size } = targets[i];
  console.log(`\n[${i + 1}/${targets.length}] ${file}  (${fmt(size)})`);
  const tmp = path + '.tmp.mp4';
  const started = Date.now();
  try {
    await compress(path, tmp);
    const { size: newSize } = await stat(tmp);
    await unlink(path);
    await rename(tmp, path);
    const elapsed = ((Date.now() - started) / 1000).toFixed(1);
    const pct = ((1 - newSize / size) * 100).toFixed(0);
    console.log(`   ✓ ${fmt(size)} → ${fmt(newSize)}  (${pct}% menor, ${elapsed}s)`);
    results.push({ file, ok: true, before: size, after: newSize });
  } catch (err) {
    console.error(`   ✗ falhou: ${err.message}`);
    try { await unlink(tmp); } catch {}
    results.push({ file, ok: false, error: err.message });
  }
}

const totalElapsed = ((Date.now() - startedAll) / 1000).toFixed(1);
const ok = results.filter((r) => r.ok);
const totalBefore = ok.reduce((s, r) => s + r.before, 0);
const totalAfter = ok.reduce((s, r) => s + r.after, 0);

console.log(`\n✅ Concluído em ${totalElapsed}s`);
console.log(`   ${ok.length}/${results.length} OK`);
console.log(`   Total antes: ${fmt(totalBefore)}`);
console.log(`   Total agora: ${fmt(totalAfter)}`);
console.log(`   Economia: ${fmt(totalBefore - totalAfter)} (${((1 - totalAfter / totalBefore) * 100).toFixed(0)}%)`);
