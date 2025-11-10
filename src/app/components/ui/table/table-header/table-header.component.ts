import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { cn } from '../../../../../lib/utils';

@Component({
  selector: 'ui-table-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-header.component.html',
  styleUrls: ['./table-header.component.scss'],
})
export class TableHeaderComponent {
  @Input()
  class?: string;

  getHeaderClasses(): string {
    return cn('[&_tr]:border-b', this.class);
  }
}
