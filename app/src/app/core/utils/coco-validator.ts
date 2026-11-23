//validador, que confere se o JSON tem o formato esperado e devolve um erro amigável quando não tem;

import {
  BoundingBox,
  CocoAnnotation,
  CocoCategory,
  CocoDataset,
  CocoImage,
} from '../models/coco.models';

export class InvalidDatasetError extends Error {}

type JsonObject = Record<string, unknown>;

// isso é uma função? como funciona esses escopos de código? como funciona a tipagem de retorno? o que é esse "value is CocoImage"?
const isObject = (value: unknown): value is JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isBoundingBox = (value: unknown): value is BoundingBox =>
  Array.isArray(value) && value.length === 4 && value.every(isNumber);

const isImage = (value: unknown): value is CocoImage =>
  isObject(value) &&
  isNumber(value['id']) &&
  typeof value['file_name'] === 'string' &&
  isNumber(value['width']) &&
  isNumber(value['height']);

const isAnnotation = (value: unknown): value is CocoAnnotation =>
  isObject(value) &&
  isNumber(value['id']) &&
  isNumber(value['image_id']) &&
  isNumber(value['category_id']) &&
  isBoundingBox(value['bbox']);

const isCategory = (value: unknown): value is CocoCategory =>
  isObject(value) && isNumber(value['id']) && typeof value['name'] === 'string';

function isArrayOf<T>(value: unknown, guard: (item: unknown) => item is T): value is T[] {
  return Array.isArray(value) && value.every(guard);
}

/** Confere se o JSON lido tem a estrutura COCO esperada e devolve o dataset tipado. */
export function parseCocoDataset(raw: unknown): CocoDataset {
  if (!isObject(raw)) {
    throw new InvalidDatasetError('O arquivo não contém um objeto JSON válido.');
  }

  const { images, annotations, categories } = raw;

  if (!isArrayOf(images, isImage)) {
    throw new InvalidDatasetError('A lista "images" está ausente ou mal formatada.');
  }
  if (!isArrayOf(annotations, isAnnotation)) {
    throw new InvalidDatasetError('A lista "annotations" está ausente ou mal formatada.');
  }
  if (!isArrayOf(categories, isCategory)) {
    throw new InvalidDatasetError('A lista "categories" está ausente ou mal formatada.');
  }

  return { images, annotations, categories };
}
