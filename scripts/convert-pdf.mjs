import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';
import { createCanvas } from '@napi-rs/canvas';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, '..');

const SRC = 'C:/Users/Pedro Talalayv/Downloads/Prancheta 2 (1).pdf';
const OUT_DIR = resolve(projectRoot, 'public/uploads');
const OUT_FILE = resolve(OUT_DIR, 'prancheta-2-hd.png');
const SCALE = 14;

const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

const data = new Uint8Array(await readFile(SRC));
const cmapsDir = pathToFileURL(
  resolve(projectRoot, 'node_modules/pdfjs-dist/cmaps') + '/',
).toString();
const standardFontsDir = pathToFileURL(
  resolve(projectRoot, 'node_modules/pdfjs-dist/standard_fonts') + '/',
).toString();

const loadingTask = pdfjs.getDocument({
  data,
  cMapUrl: cmapsDir,
  cMapPacked: true,
  standardFontDataUrl: standardFontsDir,
  disableFontFace: true,
  useSystemFonts: false,
});

const pdf = await loadingTask.promise;
const page = await pdf.getPage(1);
const viewport = page.getViewport({ scale: SCALE });

const canvas = createCanvas(Math.ceil(viewport.width), Math.ceil(viewport.height));
const ctx = canvas.getContext('2d');

await page.render({
  canvasContext: ctx,
  viewport,
  canvas,
}).promise;

await mkdir(OUT_DIR, { recursive: true });
const png = await canvas.encode('png');
await writeFile(OUT_FILE, png);

console.log(
  `OK ${OUT_FILE} ${canvas.width}x${canvas.height}px ${(png.length / 1024).toFixed(1)}KB`,
);
