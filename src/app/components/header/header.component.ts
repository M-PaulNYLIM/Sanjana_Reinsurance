import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import { AuthService } from '../../auth/auth.service';
import { RoleKey } from '../../auth/auth.models';
import { ButtonComponent } from '../ui/button/button.component';
import { DropdownMenuComponent, DropdownMenuItemComponent } from '../ui/dropdown-menu';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ButtonComponent,
    DropdownMenuComponent,
    DropdownMenuItemComponent,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  readonly user$: ReturnType<AuthService['ensureInitialized']>;
  readonly roles$: AuthService['roles$'];
  readonly activeRole$: AuthService['activeRole$'];

  constructor(private readonly auth: AuthService, private readonly router: Router) {
    this.user$ = this.auth.ensureInitialized();
    this.roles$ = this.auth.roles$;
    this.activeRole$ = this.auth.activeRole$;
  }

  roleLabel(role: RoleKey | null): string {
    if (!role) {
      return '';
    }
    return this.auth.getRoleConfig(role)?.label ?? '';
  }

  switchRole(role: RoleKey): void {
    if (role === this.auth.activeRole) {
      return;
    }
    this.auth.setActiveRole(role, false);
    const currentUrl = this.router.url;
    if (this.auth.isRouteAllowed(currentUrl)) {
      return;
    }
    const landing = this.auth.getRoleConfig(role)?.landingRoute ?? 'dashboard';
    void this.router.navigate(['/', landing]);
  }
}
