import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../../lib/utils';

@Component({
  selector: 'ui-card-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-header.component.html',
  styleUrls: ['./card-header.component.scss'],
})
export class CardHeaderComponent {
  @Input()
  class?: string;

  getHeaderClasses(): string {
    return cn('flex flex-col space-y-1.5 p-6', this.class);
  }
}
