import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-dialog-trigger',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog-trigger.component.html',
  styleUrls: ['./dialog-trigger.component.scss'],
})
export class DialogTriggerComponent {
  @Output()
  trigger = new EventEmitter<void>();

  openDialog(): void {
    this.trigger.emit();
  }
}
