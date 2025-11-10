import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../../lib/utils';

@Component({
  selector: 'ui-card-title',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-title.component.html',
  styleUrls: ['./card-title.component.scss'],
})
export class CardTitleComponent {
  @Input()
  class?: string;

  getTitleClasses(): string {
    return cn('text-2xl font-semibold leading-none tracking-tight', this.class);
  }
}
