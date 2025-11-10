import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { cn } from '../../../../../lib/utils';

@Component({
  selector: 'ui-dropdown-menu-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown-menu-item.component.html',
  styleUrls: ['./dropdown-menu-item.component.scss'],
})
export class DropdownMenuItemComponent {
  @Input()
  disabled = false;

  @Input()
  class?: string;

  @Output()
  selected = new EventEmitter<void>();

  handleClick(): void {
    if (!this.disabled) {
      this.selected.emit();
    }
  }

  getItemClasses(): string {
    return cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors',
      'hover:bg-accent hover:text-accent-foreground',
      'focus:bg-accent focus:text-accent-foreground',
      this.disabled ? 'pointer-events-none opacity-50' : '',
      this.class,
    );
  }
}
