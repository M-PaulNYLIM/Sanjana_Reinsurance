import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-accordion',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accordion.component.html',
  styleUrls: ['./accordion.component.scss'],
})
export class AccordionComponent {
  @Input()
  type: 'single' | 'multiple' = 'single';

  @Input()
  value: string | string[] = '';

  @Output()
  valueChange = new EventEmitter<string | string[]>();

  openItems: Set<string> = new Set();

  ngOnInit(): void {
    if (this.type === 'multiple' && Array.isArray(this.value)) {
      this.openItems = new Set(this.value);
    } else if (this.type === 'single' && typeof this.value === 'string') {
      this.openItems = new Set([this.value]);
    }
  }

  toggleItem(value: string): void {
    if (this.type === 'single') {
      this.openItems.clear();
      if (!this.openItems.has(value)) {
        this.openItems.add(value);
      }
      this.valueChange.emit(value);
    } else {
      if (this.openItems.has(value)) {
        this.openItems.delete(value);
      } else {
        this.openItems.add(value);
      }
      this.valueChange.emit(Array.from(this.openItems));
    }
  }

  isOpen(value: string): boolean {
    return this.openItems.has(value);
  }
}
