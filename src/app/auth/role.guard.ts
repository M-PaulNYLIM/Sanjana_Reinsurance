import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateChild,
  CanMatch,
  Route,
  Router,
  UrlSegment,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { RoleKey } from './auth.models';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivateChild, CanMatch {
  constructor(private readonly auth: AuthService, private readonly router: Router) {}

  canActivateChild(childRoute: ActivatedRouteSnapshot): boolean | UrlTree {
    return this.evaluateRoles(childRoute.data?.['allowedRoles'] as RoleKey[] | undefined, childRoute);
  }

  canMatch(route: Route, _segments: UrlSegment[]): boolean | UrlTree {
    return this.evaluateRoles(route.data?.['allowedRoles'] as RoleKey[] | undefined, route);
  }

  private evaluateRoles(
    allowedRoles: RoleKey[] | undefined,
    route: ActivatedRouteSnapshot | Route,
  ): boolean | UrlTree {
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    const activeRole = this.auth.activeRole;
    if (!activeRole) {
      return this.router.createUrlTree(['/select-role']);
    }

    if (allowedRoles.includes(activeRole)) {
      return true;
    }

    const fallback = (route.data?.['redirectOnDeny'] as string | undefined) ||
      this.auth.getRoleConfig(activeRole)?.landingRoute ||
      'dashboard';

    return this.router.createUrlTree(['/', fallback]);
  }
}
