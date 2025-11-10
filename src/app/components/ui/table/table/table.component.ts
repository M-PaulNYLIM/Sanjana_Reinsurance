import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { cn } from '../../../../../lib/utils';

@Component({
  selector: 'ui-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
})
export class TableComponent {
  @Input()
  class?: string;

  getTableClasses(): string {
    return cn('w-full min-w-full caption-bottom text-sm', this.class);
  }
}
