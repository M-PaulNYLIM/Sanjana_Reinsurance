import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ui-tabs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss'],
})
export class TabsComponent {
  @Input()
  value: string = '';

  @Output()
  valueChange = new EventEmitter<string>();

  onValueChange(value: string): void {
    this.value = value;
    this.valueChange.emit(value);
  }
}
