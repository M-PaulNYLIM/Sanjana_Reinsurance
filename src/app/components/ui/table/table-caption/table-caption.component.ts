import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { cn } from '../../../../../lib/utils';

@Component({
  selector: 'ui-table-caption',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-caption.component.html',
  styleUrls: ['./table-caption.component.scss'],
})
export class TableCaptionComponent {
  @Input()
  class?: string;

  getCaptionClasses(): string {
    return cn('mt-4 text-sm text-muted-foreground', this.class);
  }
}
