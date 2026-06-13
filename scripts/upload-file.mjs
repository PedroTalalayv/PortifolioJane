/**
 * Sobe um arquivo único pro bucket Supabase via S3.
 *
 * Uso:
 *   node --env-file=.env.local scripts/upload-file.mjs "<caminho local>" "<chave remota>"
 *
 * Exemplo:
 *   node --env-file=.env.local scripts/upload-file.mjs "C:/img.png" feed/img.png
 */
import { readFileSync } from 'node:fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const [, , localPath, remoteKey] = process.argv;
if (!localPath || !remoteKey) {
  console.error('uso: node upload-file.mjs <caminho-local> <chave-remota>');
  process.exit(1);
}

const env = {
  endpoint: process.env.SUPABASE_S3_ENDPOINT,
  region: process.env.SUPABASE_S3_REGION,
  accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY,
  bucket: process.env.SUPABASE_BUCKET,
};
const missing = Object.entries(env).filter(([, v]) => !v).map(([k]) => k);
if (missing.length) {
  console.error('faltando env vars:', missing.join(', '));
  process.exit(1);
}

const CONTENT_TYPES = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  mp4: 'video/mp4',
  webm: 'video/webm',
};

const ext = localPath.split('.').pop()?.toLowerCase() ?? '';
const contentType = CONTENT_TYPES[ext] ?? 'application/octet-stream';

const client = new S3Client({
  endpoint: env.endpoint,
  region: env.region,
  credentials: {
    accessKeyId: env.accessKeyId,
    secretAccessKey: env.secretAccessKey,
  },
  forcePathStyle: true,
});

const body = readFileSync(localPath);
const sizeMB = (body.length / 1024 / 1024).toFixed(2);

console.log(`→ ${localPath}  (${sizeMB} MB, ${contentType})`);
console.log(`  bucket: ${env.bucket}  key: ${remoteKey}`);

await client.send(
  new PutObjectCommand({
    Bucket: env.bucket,
    Key: remoteKey,
    Body: body,
    ContentType: contentType,
  }),
);

console.log(`✓ upload OK`);
console.log(`  URL pública: ${env.endpoint.replace('/storage/v1/s3', '/storage/v1/object/public')}/${env.bucket}/${remoteKey}`);
