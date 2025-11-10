import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../../lib/utils';

@Component({
  selector: 'ui-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
})
export class CardComponent {
  @Input()
  class?: string;

  getCardClasses(): string {
    return cn('rounded-lg border bg-card text-card-foreground shadow-sm', this.class);
  }
}
