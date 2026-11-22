//serviço, que busca o arquivo, guarda o resultado e avisa a tela.
//Os componentes só mostram dados, e quem cuida deles é o serviço.

import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { CocoDataset } from '../models/coco.models';
import { InvalidDatasetError, parseCocoDataset } from '../utils/coco-validator';
import { GalleryItem } from '../models/gallery-item.model';

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