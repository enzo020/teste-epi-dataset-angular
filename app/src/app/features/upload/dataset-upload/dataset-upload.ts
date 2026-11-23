import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-dataset-upload',
  templateUrl: './dataset-upload.html',
  styleUrl: './dataset-upload.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasetUpload {
  readonly fileSelected = output<File>();

  protected onChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.fileSelected.emit(file);
    }
    input.value = '';
  }
}