import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CategoryLegendItem } from '../../../core/models/viewer.model';

@Component({
  selector: 'app-class-filter',
  templateUrl: './class-filter.html',
  styleUrl: './class-filter.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ClassFilter {
  readonly options = input.required<CategoryLegendItem[]>();
  readonly selected = input.required<string | null>();
  readonly categoryChange = output<string | null>();
}