import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'ui-tabs-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabs-list.component.html',
  styleUrls: ['./tabs-list.component.scss'],
})
export class TabsListComponent {}
