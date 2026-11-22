//serviço, que busca o arquivo, guarda o resultado e avisa a tela.
//Os componentes só mostram dados, e quem cuida deles é o serviço.

import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CocoDataset } from '../models/coco.models';
import { GalleryItem } from '../models/gallery-item.model';
import { CategoryLegendItem, ViewerBox } from '../models/viewer.model';
import { getCategoryColor } from '../utils/category-colors';
import { InvalidDatasetError, parseCocoDataset } from '../utils/coco-validator';

const DEFAULT_DATASET_URL = 'dataset/annotations_coco.json';
const IMAGES_BASE_URL = 'dataset/images/';

function toFriendlyMessage(error: unknown): string {
  if (error instanceof InvalidDatasetError) {
    return error.message;
  }
  if (error instanceof SyntaxError) {
    return 'O arquivo não é um JSON válido.';
  }
  return 'Não foi possível carregar o arquivo de anotações.';
}

@Injectable({ providedIn: 'root' })
export class DatasetService {
  private readonly http = inject(HttpClient);

  private readonly datasetState = signal<CocoDataset | null>(null);
  private readonly errorState = signal<string | null>(null);
  private readonly loadingState = signal(false);

  readonly dataset = this.datasetState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly loading = this.loadingState.asReadonly();

  readonly galleryItems = computed<GalleryItem[]>(() => {
    const dataset = this.datasetState();
    if (!dataset) {
      return [];
    }

    const countByImage = new Map<number, number>();
    for (const annotation of dataset.annotations) {
      countByImage.set(annotation.image_id, (countByImage.get(annotation.image_id) ?? 0) + 1);
    }

    return dataset.images.map((image) => ({
      image,
      url: IMAGES_BASE_URL + image.file_name,
      annotationCount: countByImage.get(image.id) ?? 0,
    }));
  });

  readonly categoryLegend = computed<CategoryLegendItem[]>(() =>
    (this.datasetState()?.categories ?? []).map((category) => ({
      id: category.id,
      name: category.name,
      color: getCategoryColor(category.name),
    })),
  );

  readonly boxesByImage = computed<Map<number, ViewerBox[]>>(() => {
    const dataset = this.datasetState();
    const boxes = new Map<number, ViewerBox[]>();
    if (!dataset) {
      return boxes;
    }

    const categoryNames = new Map<number, string>(
      dataset.categories.map((category): [number, string] => [category.id, category.name]),
    );

    for (const annotation of dataset.annotations) {
      const label = categoryNames.get(annotation.category_id) ?? 'desconhecida';
      const [x, y, width, height] = annotation.bbox;
      const imageBoxes = boxes.get(annotation.image_id) ?? [];
      imageBoxes.push({ id: annotation.id, x, y, width, height, label, color: getCategoryColor(label) });
      boxes.set(annotation.image_id, imageBoxes);
    }
    return boxes;
  });

  async loadDefault(): Promise<void> {
    await this.load(() => firstValueFrom(this.http.get<unknown>(DEFAULT_DATASET_URL)));
  }

  async loadFromFile(file: File): Promise<void> {
    await this.load(async () => JSON.parse(await file.text()) as unknown);
  }

  private async load(read: () => Promise<unknown>): Promise<void> {
    this.loadingState.set(true);
    this.errorState.set(null);
    try {
      this.datasetState.set(parseCocoDataset(await read()));
    } catch (error) {
      this.datasetState.set(null);
      this.errorState.set(toFriendlyMessage(error));
    } finally {
      this.loadingState.set(false);
    }
  }
}