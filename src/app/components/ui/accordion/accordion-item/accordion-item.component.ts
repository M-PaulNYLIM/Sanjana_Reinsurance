import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-accordion-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accordion-item.component.html',
  styleUrls: ['./accordion-item.component.scss'],
})
export class AccordionItemComponent {
  @Input()
  value: string = '';

  @Input()
  className: string = '';

  getItemClasses(): string {
    return `border-b ${this.className}`;
  }
}
