import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'ui-tabs-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs-content.component.html',
  styleUrls: ['./tabs-content.component.scss'],
})
export class TabsContentComponent {
  @Input()
  value: string = '';

  @Input()
  activeValue: string = '';
}
