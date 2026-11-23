import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { DatasetStats } from '../../../core/models/stats.model';

@Component({
  selector: 'app-stats-panel',
  templateUrl: './stats-panel.html',
  styleUrl: './stats-panel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatsPanel {
  readonly stats = input.required<DatasetStats>();
}