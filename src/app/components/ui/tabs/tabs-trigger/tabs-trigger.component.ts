import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ui-tabs-trigger',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs-trigger.component.html',
  styleUrls: ['./tabs-trigger.component.scss'],
})
export class TabsTriggerComponent {
  @Input()
  value: string = '';

  @Input()
  activeValue: string = '';

  @Output()
  trigger = new EventEmitter<string>();

  onClick(): void {
    this.trigger.emit(this.value);
  }

  getClasses(): string {
    const baseClasses =
      'inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border w-full text-center';

    if (this.activeValue === this.value) {
      return `${baseClasses} bg-white text-nyl-navy border-nyl-blue shadow-sm`;
    }

    return `${baseClasses} bg-white text-gray-700 border-gray-200 hover:border-nyl-blue hover:text-nyl-blue`;
  }
}
