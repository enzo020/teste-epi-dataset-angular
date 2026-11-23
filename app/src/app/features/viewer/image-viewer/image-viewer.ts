import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { GalleryItem } from '../../../core/models/gallery-item.model';
import { CategoryLegendItem, ViewerBox } from '../../../core/models/viewer.model';

@Component({
  selector: 'app-image-viewer',
  templateUrl: './image-viewer.html',
  styleUrl: './image-viewer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageViewer {
  readonly item = input.required<GalleryItem>();
  readonly boxes = input.required<ViewerBox[]>();
  readonly legend = input.required<CategoryLegendItem[]>();
  readonly closed = output<void>();

  protected readonly viewBox = computed(() => {
    const { width, height } = this.item().image;
    return `0 0 ${width} ${height}`;
  });
}
