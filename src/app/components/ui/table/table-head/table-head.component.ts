import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { cn } from '../../../../../lib/utils';

@Component({
  selector: 'ui-table-head',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-head.component.html',
  styleUrls: ['./table-head.component.scss'],
})
export class TableHeadComponent {
  @Input()
  class?: string;

  getHeadClasses(): string {
    return cn(
      'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
      this.class,
    );
  }
}
