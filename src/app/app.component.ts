import { Component } from '@angular/core';
import { LayoutComponent } from './components/layout/layout.component';
import { ToasterComponent } from './components/ui/toaster/toaster.component';
import { LoaderOverlayComponent } from './components/ui/loader/loader-overlay.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LayoutComponent, ToasterComponent, LoaderOverlayComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'reinsurance-angular';
}
