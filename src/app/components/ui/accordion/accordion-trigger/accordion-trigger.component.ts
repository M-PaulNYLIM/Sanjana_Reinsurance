import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccordionComponent } from '../accordion/accordion.component';

@Component({
  selector: 'ui-accordion-trigger',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './accordion-trigger.component.html',
  styleUrls: ['./accordion-trigger.component.scss'],
})
export class AccordionTriggerComponent {
  @Input()
  value: string = '';

  @Input()
  accordion?: AccordionComponent;

  @Input()
  className: string = '';

  get isOpen(): boolean {
    return this.accordion?.isOpen(this.value) ?? false;
  }

  onToggle(): void {
    this.accordion?.toggleItem(this.value);
  }

  getTriggerClasses(): string {
    return `flex flex-1 items-center justify-between py-4 font-medium transition-all no-underline hover:no-underline focus:no-underline [&[data-state=open]>svg]:rotate-180 ${this.className}`;
  }
}
