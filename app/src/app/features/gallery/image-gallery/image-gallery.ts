import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { GalleryItem } from '../../../core/models/gallery-item.model';

@Component({
  selector: 'app-image-gallery',
  templateUrl: './image-gallery.html',
  styleUrl: './image-gallery.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageGallery {
  readonly items = input.required<GalleryItem[]>();
  readonly selected = output<GalleryItem>();
}