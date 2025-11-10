import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../../lib/utils';

@Component({
  selector: 'ui-card-description',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-description.component.html',
  styleUrls: ['./card-description.component.scss'],
})
export class CardDescriptionComponent {
  @Input()
  class?: string;

  getDescriptionClasses(): string {
    return cn('text-sm text-muted-foreground', this.class);
  }
}
