import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { DatasetService } from './core/services/dataset.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
  protected readonly datasetService = inject(DatasetService);

  ngOnInit(): void {
    void this.datasetService.loadDefault();
  }
}