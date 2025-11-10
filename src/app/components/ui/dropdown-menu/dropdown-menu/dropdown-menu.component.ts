import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { cn } from '../../../../../lib/utils';

@Component({
  selector: 'ui-dropdown-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dropdown-menu.component.html',
  styleUrls: ['./dropdown-menu.component.scss'],
})
export class DropdownMenuComponent {
  @Input()
  align: 'start' | 'center' | 'end' = 'start';

  @Input()
  class?: string;

  @Output()
  openChange = new EventEmitter<boolean>();

  isOpen = false;

  @ViewChild('dropdownContainer', { static: false })
  dropdownContainer!: ElementRef<HTMLElement>;

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    this.openChange.emit(this.isOpen);
  }

  closeDropdown(): void {
    this.isOpen = false;
    this.openChange.emit(this.isOpen);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.dropdownContainer && !this.dropdownContainer.nativeElement.contains(event.target as Node)) {
      this.closeDropdown();
    }
  }

  getContentClasses(): string {
    const alignClasses: Record<'start' | 'center' | 'end', string> = {
      start: 'left-0',
      center: 'left-1/2 transform -translate-x-1/2',
      end: 'right-0',
    };

    return cn(
      'absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg',
      alignClasses[this.align],
      this.class,
    );
  }
}
