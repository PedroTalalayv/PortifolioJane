/**
 * Sobe os vídeos de public/uploads/motion/ pro bucket S3-compatível do Supabase.
 *
 * Como rodar:
 *   1. cria um .env.local na raiz com:
 *        SUPABASE_S3_ENDPOINT=https://<projeto>.storage.supabase.co/storage/v1/s3
 *        SUPABASE_S3_REGION=us-east-1
 *        SUPABASE_S3_ACCESS_KEY_ID=<access key id curto>
 *        SUPABASE_S3_SECRET_ACCESS_KEY=<secret hex longo>
 *        SUPABASE_BUCKET=designJane
 *   2. node --env-file=.env.local scripts/upload-videos.mjs
 *
 * O script usa multipart upload (partes de 8MB) com 4 streams em paralelo,
 * então arquivos de 200MB+ sobem sem problema mesmo em conexões instáveis.
 */
import { readdir, stat, writeFile } from 'node:fs/promises';
import { createReadStream } from 'node:fs';
import { join } from 'node:path';
import { S3Client } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

const env = {
  endpoint: process.env.SUPABASE_S3_ENDPOINT,
  region: process.env.SUPABASE_S3_REGION,
  accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY,
  bucket: process.env.SUPABASE_BUCKET,
};

const missing = Object.entries(env)
  .filter(([, v]) => !v)
  .map(([k]) => k);
if (missing.length) {
  console.error('❌ Faltando env vars:', missing.join(', '));
  console.error('   Cria um .env.local na raiz com SUPABASE_S3_* (ver topo do script).');
  process.exit(1);
}

const SRC_DIR = './public/uploads/motion';
const REMOTE_PREFIX = 'motion/';

const client = new S3Client({
  endpoint: env.endpoint,
  region: env.region,
  credentials: {
    accessKeyId: env.accessKeyId,
    secretAccessKey: env.secretAccessKey,
  },
  forcePathStyle: true, // Supabase usa path-style URLs
});

const fmt = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`;

async function uploadOne(localPath, remoteKey, size) {
  const upload = new Upload({
    client,
    params: {
      Bucket: env.bucket,
      Key: remoteKey,
      Body: createReadStream(localPath),
      ContentType: 'video/mp4',
    },
    partSize: 8 * 1024 * 1024,
    queueSize: 4,
  });

  let lastPct = -1;
  upload.on('httpUploadProgress', (p) => {
    const loaded = p.loaded ?? 0;
    const pct = Math.floor((loaded / size) * 100);
    if (pct !== lastPct) {
      lastPct = pct;
      process.stdout.write(`\r   ${String(pct).padStart(3)}%  ${fmt(loaded)} / ${fmt(size)}`);
    }
  });

  await upload.done();
  process.stdout.write('\n   ✓\n');
}

const files = (await readdir(SRC_DIR)).filter((f) => f.endsWith('.mp4'));

if (!files.length) {
  console.error(`❌ Nenhum .mp4 encontrado em ${SRC_DIR}`);
  process.exit(1);
}

console.log(`📦 Bucket: ${env.bucket}`);
console.log(`📡 Endpoint: ${env.endpoint}`);
console.log(`🎬 Encontrados ${files.length} vídeos\n`);

const mapping = {};
const startedAt = Date.now();

for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const localPath = join(SRC_DIR, file);
  const remoteKey = REMOTE_PREFIX + file;
  const { size } = await stat(localPath);

  console.log(`[${i + 1}/${files.length}] ${file}  (${fmt(size)})`);
  try {
    await uploadOne(localPath, remoteKey, size);
    mapping[file] = remoteKey;
  } catch (err) {
    console.error(`   ✗ falhou: ${err.message}`);
  }
}

const elapsed = ((Date.now() - startedAt) / 1000).toFixed(1);

console.log(`\n✅ Upload concluído em ${elapsed}s`);
console.log(`   ${Object.keys(mapping).length}/${files.length} arquivos OK\n`);

// salva o mapping pro próximo passo
const out = './scripts/upload-mapping.json';
await writeFile(out, JSON.stringify(mapping, null, 2));
console.log(`📝 mapping salvo em ${out} (usado depois pra trocar URLs no Motion.tsx)`);
