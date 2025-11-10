import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
})
export class DialogComponent {
  @Input()
  isOpen: boolean = false;

  @Output()
  isOpenChange = new EventEmitter<boolean>();

  close(): void {
    this.isOpen = false;
    this.isOpenChange.emit(false);
  }
}
