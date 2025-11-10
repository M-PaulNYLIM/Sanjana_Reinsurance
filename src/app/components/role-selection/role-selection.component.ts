import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { ROLE_CONFIG, RoleConfig, RoleKey } from '../../auth/auth.models';

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [CommonModule, RouterModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './role-selection.component.html',
  styleUrls: ['./role-selection.component.scss'],
})
export class RoleSelectionComponent implements OnInit, OnDestroy {
  readonly userName = signal('');
  readonly availableRoles = signal<RoleConfig[]>([]);
  readonly activeRole = signal<RoleKey | null>(null);
  readonly selectedRoleConfig = computed(() => {
    const current = this.activeRole();
    return this.availableRoles().find((role) => role.key === current) ?? null;
  });
  readonly selectedLandingLabel = computed(() => {
    const selected = this.selectedRoleConfig();
    if (!selected) {
      return null;
    }
    const normalizedLanding = selected.landingRoute.replace(/^\//, '');
    const matchedLink = selected.navigationLinks.find(
      (link) => link.path.replace(/^\//, '') === normalizedLanding,
    );
    if (matchedLink) {
      return matchedLink.label;
    }
    return this.formatRouteName(normalizedLanding);
  });

  private subscriptions = new Subscription();
  private returnUrl: string | null = null;

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');

    const sub = this.auth.initialize().subscribe((user) => {
      this.userName.set(user.displayName);
      const configs = user.roles
        .map((role) => ROLE_CONFIG[role])
        .filter((config): config is RoleConfig => Boolean(config));
      this.availableRoles.set(configs);
      const current = this.auth.activeRole;
      this.activeRole.set(current ?? null);
    });
    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onRoleSelectionChange(value: string): void {
    if (!value) {
      this.activeRole.set(null);
      return;
    }
    this.activeRole.set(value as RoleKey);
  }

  confirmSelection(): void {
    const role = this.activeRole();
    if (!role) {
      return;
    }
    this.selectRole(role);
  }

  formatRouteName(value: string): string {
    return value
      .replace(/^\//, '')
      .split(/[\/-]/)
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ');
  }

  private selectRole(role: RoleKey): void {
    this.auth.setActiveRole(role, false);
    const landing = this.auth.getRoleConfig(role)?.landingRoute ?? 'dashboard';
    const target = this.returnUrl && this.returnUrl.length ? this.returnUrl : `/${landing}`;
    void this.router.navigateByUrl(target);
  }
}
