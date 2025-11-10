import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionComponent } from '../accordion/accordion.component';

@Component({
  selector: 'ui-accordion-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accordion-content.component.html',
  styleUrls: ['./accordion-content.component.scss'],
})
export class AccordionContentComponent {
  @Input()
  value: string = '';

  @Input()
  accordion?: AccordionComponent;

  get isOpen(): boolean {
    return this.accordion?.isOpen(this.value) ?? false;
  }
}
