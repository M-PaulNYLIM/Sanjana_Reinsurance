import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { cn } from '../../../../../lib/utils';

@Component({
  selector: 'ui-table-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-row.component.html',
  styleUrls: ['./table-row.component.scss'],
})
export class TableRowComponent {
  @Input()
  class?: string;

  @Input()
  selected?: boolean;

  getRowClasses(): string {
    return cn(
      'border-b transition-colors hover:bg-muted/50',
      this.selected ? 'bg-muted' : '',
      this.class,
    );
  }
}
