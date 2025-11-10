import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { cn } from '../../../../../lib/utils';

@Component({
  selector: 'ui-table-body',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-body.component.html',
  styleUrls: ['./table-body.component.scss'],
})
export class TableBodyComponent {
  @Input()
  class?: string;

  getBodyClasses(): string {
    return cn('[&_tr:last-child]:border-0', this.class);
  }
}
