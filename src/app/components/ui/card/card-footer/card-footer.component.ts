import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cn } from '../../../../../lib/utils';

@Component({
  selector: 'ui-card-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './card-footer.component.html',
  styleUrls: ['./card-footer.component.scss'],
})
export class CardFooterComponent {
  @Input()
  class?: string;

  getFooterClasses(): string {
    return cn('flex items-center p-6 pt-0', this.class);
  }
}
