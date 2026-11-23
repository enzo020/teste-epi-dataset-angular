import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { GalleryItem } from './core/models/gallery-item.model';
import { ViewerBox } from './core/models/viewer.model';
import { DatasetService } from './core/services/dataset.service';
import { ClassFilter } from './features/filter/class-filter/class-filter';
import { ImageGallery } from './features/gallery/image-gallery/image-gallery';
import { StatsPanel } from './features/stats/stats-panel/stats-panel';
import { ImageViewer } from './features/viewer/image-viewer/image-viewer';

@Component({
  selector: 'app-root',
  imports: [ClassFilter, ImageGallery, ImageViewer, StatsPanel],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  protected readonly datasetService = inject(DatasetService);

  private readonly selectedId = signal<number | null>(null);
  private readonly selectedCategory = signal<string | null>(null);

  protected readonly activeCategory = this.selectedCategory.asReadonly();

  protected readonly selectedItem = computed(() => {
    const id = this.selectedId();
    return this.datasetService.galleryItems().find((item) => item.image.id === id) ?? null;
  });

  protected readonly selectedBoxes = computed<ViewerBox[]>(() => {
    const id = this.selectedId();
    return id === null ? [] : (this.datasetService.boxesByImage().get(id) ?? []);
  });

  protected readonly visibleItems = computed<GalleryItem[]>(() => {
    const category = this.selectedCategory();
    const items = this.datasetService.galleryItems();
    if (category === null) {
      return items;
    }
    const boxes = this.datasetService.boxesByImage();
    return items.filter(
      (item) => boxes.get(item.image.id)?.some((box) => box.label === category) ?? false,
    );
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

  protected filterBy(category: string | null): void {
    this.selectedCategory.set(category);
  }
}