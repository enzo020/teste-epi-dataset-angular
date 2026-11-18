// Converte as anotações YOLO (makesense.ai) em um único arquivo COCO JSON.
// Uso (a partir da raiz do repositório): node tools/yolo-to-coco.mjs
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, parse } from 'node:path';

const IMAGES_DIR = 'dataset/images';
const YOLO_DIR = 'dataset/annotations_yolo';
const OUTPUT_FILE = 'dataset/annotations_coco.json';

// Mesma ordem em que as labels foram criadas no makesense.ai (YOLO usa o índice 0, 1, 2...).
const CLASSES = ['pessoa', 'capacete', 'sem_capacete', 'colete'];

/** Lê largura e altura de um PNG ou JPEG a partir do cabeçalho do arquivo. */
function readImageSize(buffer, fileName) {
  // PNG: assinatura de 8 bytes, largura e altura nos bytes 16-23.
  if (buffer.readUInt32BE(0) === 0x89504e47) {
    return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
  }
  // JPEG: percorre os marcadores até achar um "start of frame" (SOF).
  if (buffer.readUInt16BE(0) === 0xffd8) {
    let offset = 2;
    while (offset < buffer.length) {
      if (buffer[offset] !== 0xff) {
        offset += 1;
        continue;
      }
      const marker = buffer[offset + 1];
      const isFrame =
        marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
      if (isFrame) {
        return {
          height: buffer.readUInt16BE(offset + 5),
          width: buffer.readUInt16BE(offset + 7),
        };
      }
      offset += 2 + buffer.readUInt16BE(offset + 2);
    }
  }
  throw new Error(`Formato de imagem não suportado (use JPG ou PNG): ${fileName}`);
}

const round = (value) => Math.round(value * 100) / 100;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const imageFiles = readdirSync(IMAGES_DIR)
  .filter((name) => /\.(jpe?g|png)$/i.test(name))
  .sort();

const coco = {
  info: { description: 'Dataset de EPIs anotado no makesense.ai (convertido de YOLO)' },
  images: [],
  annotations: [],
  categories: CLASSES.map((name, index) => ({ id: index + 1, name })),
};

const warnings = [];
let annotationId = 1;

imageFiles.forEach((fileName, index) => {
  const imageId = index + 1;
  const { width, height } = readImageSize(readFileSync(join(IMAGES_DIR, fileName)), fileName);
  coco.images.push({ id: imageId, file_name: fileName, width, height });

  const labelPath = join(YOLO_DIR, `${parse(fileName).name}.txt`);
  if (!existsSync(labelPath)) {
    warnings.push(`Sem arquivo de anotação para ${fileName}`);
    return;
  }

  const lines = readFileSync(labelPath, 'utf8').split('\n').filter((line) => line.trim());
  for (const line of lines) {
    const [classIndex, xCenter, yCenter, boxWidth, boxHeight] = line.trim().split(/\s+/).map(Number);
    if (!CLASSES[classIndex]) {
      throw new Error(`Classe ${classIndex} inexistente em ${labelPath}`);
    }
    const x = clamp((xCenter - boxWidth / 2) * width, 0, width);
    const y = clamp((yCenter - boxHeight / 2) * height, 0, height);
    const w = clamp(boxWidth * width, 0, width - x);
    const h = clamp(boxHeight * height, 0, height - y);
    coco.annotations.push({
      id: annotationId++,
      image_id: imageId,
      category_id: classIndex + 1,
      bbox: [round(x), round(y), round(w), round(h)],
      area: round(w * h),
      iscrowd: 0,
    });
  }
});

const imageNames = new Set(imageFiles.map((name) => parse(name).name));
readdirSync(YOLO_DIR)
  .filter((name) => name.endsWith('.txt') && !imageNames.has(parse(name).name))
  .forEach((name) => warnings.push(`Anotação sem imagem correspondente: ${name}`));

writeFileSync(OUTPUT_FILE, JSON.stringify(coco, null, 2));

console.log(`Imagens: ${coco.images.length} | Anotações: ${coco.annotations.length}`);
coco.categories.forEach(({ id, name }) => {
  const count = coco.annotations.filter((annotation) => annotation.category_id === id).length;
  console.log(`  ${name}: ${count}`);
});
warnings.forEach((message) => console.warn(`AVISO: ${message}`));
