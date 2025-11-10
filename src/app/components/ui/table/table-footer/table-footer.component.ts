import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { cn } from '../../../../../lib/utils';

@Component({
  selector: 'ui-table-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './table-footer.component.html',
  styleUrls: ['./table-footer.component.scss'],
})
export class TableFooterComponent {
  @Input()
  class?: string;

  getFooterClasses(): string {
    return cn('border-t bg-muted/50 font-medium [&>tr]:last:border-b-0', this.class);
  }
}
