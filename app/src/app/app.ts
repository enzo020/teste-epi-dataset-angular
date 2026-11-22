import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { DatasetService } from './core/services/dataset.service';
import { ImageGallery } from './features/gallery/image-gallery/image-gallery';

@Component({
  selector: 'app-root',
  imports: [ImageGallery],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  protected readonly datasetService = inject(DatasetService);

  ngOnInit(): void {
    void this.datasetService.loadDefault();
  }
}