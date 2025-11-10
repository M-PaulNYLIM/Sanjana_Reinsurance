import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { cn } from '../../../../../lib/utils';

@Component({
  selector: 'ui-dropdown-menu-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown-menu-content.component.html',
  styleUrls: ['./dropdown-menu-content.component.scss'],
})
export class DropdownMenuContentComponent {
  @Input()
  class?: string;

  getContentClasses(): string {
    return cn('z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg', this.class);
  }
}
