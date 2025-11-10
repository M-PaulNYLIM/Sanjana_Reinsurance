import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { cn } from '../../../../../lib/utils';

@Component({
  selector: 'ui-table-cell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-cell.component.html',
  styleUrls: ['./table-cell.component.scss'],
})
export class TableCellComponent {
  @Input()
  class?: string;

  getCellClasses(): string {
    return cn('p-4 align-middle [&:has([role=checkbox])]:pr-0', this.class);
  }
}
