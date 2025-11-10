import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { LoadingService } from '../../../../services/http-interceptors.service';

@Component({
  selector: 'ui-loader-overlay',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loader-overlay.component.html',
  styleUrls: ['./loader-overlay.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoaderOverlayComponent {
  constructor(public readonly loading: LoadingService) {}
}
