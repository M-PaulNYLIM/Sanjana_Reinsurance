import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-dialog-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog-content.component.html',
  styleUrls: ['./dialog-content.component.scss'],
})
export class DialogContentComponent {
  @Output()
  close = new EventEmitter<void>();

  onClose(): void {
    this.close.emit();
  }
}
