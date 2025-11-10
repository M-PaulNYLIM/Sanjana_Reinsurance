import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../../lib/utils';

@Component({
  selector: 'ui-card-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-content.component.html',
  styleUrls: ['./card-content.component.scss'],
})
export class CardContentComponent {
  @Input()
  class?: string;

  getContentClasses(): string {
    return cn('p-6 pt-0', this.class);
  }
}
