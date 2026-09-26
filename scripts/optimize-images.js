const fs = require('fs/promises');
const path = require('path');
const sharp = require('sharp');

const projectRoot = path.resolve(__dirname, '..');
const htmlPath = path.join(projectRoot, 'index.html');
const imageRoot = path.join(projectRoot, 'img');
const generatedRoot = path.join(imageRoot, 'generated');
const supportedExtensions = new Set(['.avif', '.jpeg', '.jpg', '.png', '.webp']);
const variants = [
  { directory: 'cards', width: 400 },
  { directory: 'thumbs', width: 800 },
  { directory: 'full', width: 1600 },
];

const normalizeWebPath = (value) => value.replace(/^\.\//, '').replace(/^\//, '').split('\\').join('/');

const getAttribute = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']+)["']`, 'i'));
  return match?.[1] || '';
};

const getSources = (html) => {
  const sources = new Set();

  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const source = getAttribute(match[0], 'data-source');
    if (!source) continue;

    const normalizedSource = normalizeWebPath(source);
    const extension = path.posix.extname(normalizedSource).toLowerCase();
    const sourceParts = normalizedSource.split('/');

    if (!normalizedSource.startsWith('img/')) continue;
    if (normalizedSource.startsWith('img/generated/')) continue;
    if (sourceParts.includes('..')) continue;
    if (!supportedExtensions.has(extension)) continue;

    sources.add(normalizedSource);
  }

  return [...sources];
};

const getOutputPath = (source, variant) => {
  const sourceWithoutExtension = source.slice(0, -path.posix.extname(source).length);
  const relativeToImageRoot = sourceWithoutExtension.replace(/^img\//, '');
  return path.join(generatedRoot, variant.directory, `${relativeToImageRoot}.webp`);
};

const formatSize = (bytes) => `${Math.round(bytes / 1024)} KiB`;

const generateVariant = async (source, variant) => {
  const inputPath = path.resolve(projectRoot, source);
  const outputPath = getOutputPath(source, variant);
  const outputDirectory = path.dirname(outputPath);

  await fs.mkdir(outputDirectory, { recursive: true });

  const info = await sharp(inputPath)
    .rotate()
    .resize({
      width: variant.width,
      height: variant.width,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: 80, effort: 4 })
    .toFile(outputPath);

  console.log(`${source} -> ${path.relative(projectRoot, outputPath)} (${info.width}x${info.height}, ${formatSize(info.size)})`);
};

const run = async () => {
  const html = await fs.readFile(htmlPath, 'utf8');
  const sources = getSources(html);

  if (!sources.length) {
    throw new Error('Nenhuma imagem de galeria válida foi encontrada em index.html.');
  }

  await fs.rm(generatedRoot, { recursive: true, force: true });

  for (const source of sources) {
    for (const variant of variants) {
      await generateVariant(source, variant);
    }
  }
};

run().catch((error) => {
  console.error(`Falha ao gerar as imagens: ${error.message}`);
  process.exitCode = 1;
});
