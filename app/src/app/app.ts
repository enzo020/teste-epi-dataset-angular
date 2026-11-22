import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { GalleryItem } from './core/models/gallery-item.model';
import { ViewerBox } from './core/models/viewer.model';
import { DatasetService } from './core/services/dataset.service';
import { ImageGallery } from './features/gallery/image-gallery/image-gallery';
import { ImageViewer } from './features/viewer/image-viewer/image-viewer';

@Component({
  selector: 'app-root',
  imports: [ImageGallery, ImageViewer],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  protected readonly datasetService = inject(DatasetService);

  private readonly selectedId = signal<number | null>(null);

  protected readonly selectedItem = computed(() => {
    const id = this.selectedId();
    return this.datasetService.galleryItems().find((item) => item.image.id === id) ?? null;
  });

  protected readonly selectedBoxes = computed<ViewerBox[]>(() => {
    const id = this.selectedId();
    return id === null ? [] : (this.datasetService.boxesByImage().get(id) ?? []);
  });

  ngOnInit(): void {
    void this.datasetService.loadDefault();
  }

  protected select(item: GalleryItem): void {
    this.selectedId.set(item.image.id);
  }

  protected closeViewer(): void {
    this.selectedId.set(null);
  }
}